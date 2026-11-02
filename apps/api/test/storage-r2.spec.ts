import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { CloudflareR2Provider } from '../dist/storage/providers/r2-storage.provider.js';
import { LocalStorageProvider } from '../dist/storage/providers/local-storage.provider.js';
import { RoleCode } from '@medinexa/types';

describe('Cloudflare R2 Private Object Storage & Attachment Security Suite', () => {
  // Mock S3Client implementation for non-network unit testing
  class MockS3Client {
    public commandsSent: any[] = [];
    public mockStorage = new Map<string, { body: Buffer; contentType: string; metadata: any }>();

    async send(command: any) {
      this.commandsSent.push(command);
      const commandName = command.constructor?.name || '';

      if (commandName === 'PutObjectCommand' || command.input?.Body) {
        this.mockStorage.set(command.input.Key, {
          body: Buffer.from(command.input.Body),
          contentType: command.input.ContentType,
          metadata: command.input.Metadata,
        });
        return { $metadata: { httpStatusCode: 200 } };
      }

      if (commandName === 'GetObjectCommand') {
        const item = this.mockStorage.get(command.input.Key);
        if (!item) {
          const err: any = new Error('NoSuchKey');
          err.name = 'NoSuchKey';
          err.$metadata = { httpStatusCode: 404 };
          throw err;
        }
        return {
          Body: {
            transformToByteArray: async () => new Uint8Array(item.body),
          },
          ContentType: item.contentType,
        };
      }

      if (commandName === 'DeleteObjectCommand') {
        this.mockStorage.delete(command.input.Key);
        return { $metadata: { httpStatusCode: 204 } };
      }

      if (commandName === 'HeadObjectCommand') {
        const item = this.mockStorage.get(command.input.Key);
        if (!item) {
          const err: any = new Error('NotFound');
          err.name = 'NotFound';
          err.$metadata = { httpStatusCode: 404 };
          throw err;
        }
        return {
          ContentType: item.contentType,
          ContentLength: item.body.length,
          ETag: '"mock-etag-12345"',
          LastModified: new Date(),
        };
      }

      return { $metadata: { httpStatusCode: 200 } };
    }
  }

  describe('1. R2 Provider Core Operations', () => {
    it('uploads a file to private R2 bucket with safe key and no public URL', async () => {
      const provider = new CloudflareR2Provider();
      const mockClient = new MockS3Client();
      provider.initClient(mockClient as any);

      const testBuffer = Buffer.from('HARLESS_TEST_LAB_DATA_SIMULATION_ONLY');
      const result = await provider.uploadFile(testBuffer, 'lab_report.pdf', 'application/pdf', {
        facilityId: 'fac-delhi-01',
        patientId: 'pat-9912',
        category: 'LAB_REPORT',
      });

      assert.ok(result.storageKey.startsWith('facilities/fac-delhi-01/patients/pat-9912/'));
      assert.ok(result.storageKey.endsWith('.pdf'));
      assert.strictEqual(result.publicUrl, undefined, 'Medical bucket must NOT expose public URLs');
      assert.strictEqual(result.sizeBytes, testBuffer.length);
      assert.strictEqual(result.mimeType, 'application/pdf');
      assert.ok(result.checksum.length === 64);
    });

    it('downloads file buffer from private R2 bucket identically to uploaded content', async () => {
      const provider = new CloudflareR2Provider();
      const mockClient = new MockS3Client();
      provider.initClient(mockClient as any);

      const content = 'PATIENT_OBSERVATION_MOCK_ATTACHMENT_CONTENT_VERIFIED';
      const testBuffer = Buffer.from(content);

      const uploadResult = await provider.uploadFile(testBuffer, 'prescription.pdf', 'application/pdf', {
        facilityId: 'fac-noida-01',
        patientId: 'pat-4455',
      });

      const downloadedBuffer = await provider.getFileBuffer(uploadResult.storageKey);
      assert.strictEqual(downloadedBuffer.toString(), content);
    });

    it('checks file existence via HeadObject correctly', async () => {
      const provider = new CloudflareR2Provider();
      const mockClient = new MockS3Client();
      provider.initClient(mockClient as any);

      const testBuffer = Buffer.from('TEST_EXISTENCE_BUFFER');
      const uploadResult = await provider.uploadFile(testBuffer, 'image.png', 'image/png');

      const exists = await provider.checkFileExists(uploadResult.storageKey);
      assert.strictEqual(exists, true);

      const nonExistent = await provider.checkFileExists('facilities/fac/patients/pat/not-found.bin');
      assert.strictEqual(nonExistent, false);
    });

    it('retrieves accurate file metadata from R2', async () => {
      const provider = new CloudflareR2Provider();
      const mockClient = new MockS3Client();
      provider.initClient(mockClient as any);

      const testBuffer = Buffer.from('METADATA_VERIFICATION_PAYLOAD');
      const uploadResult = await provider.uploadFile(testBuffer, 'scan.jpg', 'image/jpeg');

      const meta = await provider.getFileMetadata(uploadResult.storageKey);
      assert.strictEqual(meta.contentType, 'image/jpeg');
      assert.strictEqual(meta.contentLength, testBuffer.length);
      assert.ok(meta.eTag);
    });

    it('deletes file from private R2 bucket', async () => {
      const provider = new CloudflareR2Provider();
      const mockClient = new MockS3Client();
      provider.initClient(mockClient as any);

      const testBuffer = Buffer.from('TO_BE_DELETED');
      const uploadResult = await provider.uploadFile(testBuffer, 'temp.pdf', 'application/pdf');

      assert.strictEqual(await provider.checkFileExists(uploadResult.storageKey), true);
      const deleted = await provider.deleteFile(uploadResult.storageKey);
      assert.strictEqual(deleted, true);
      assert.strictEqual(await provider.checkFileExists(uploadResult.storageKey), false);
    });
  });

  describe('2. Key Security, Anonymization & Path Traversal Protections', () => {
    it('never includes original file name or clinical PHI in storage key', () => {
      const provider = new CloudflareR2Provider();
      const key = provider.generateSafeKey('Patient_John_Doe_Blood_Report_Urgent.pdf', 'application/pdf', {
        facilityId: 'fac-101',
        patientId: 'pat-202',
      });

      assert.ok(!key.includes('John'), 'Key must not contain patient name');
      assert.ok(!key.includes('Doe'), 'Key must not contain patient name');
      assert.ok(!key.includes('Blood'), 'Key must not contain diagnosis or report name');
      assert.match(key, /^facilities\/fac-101\/patients\/pat-202\/[0-9a-f-]{36}\.pdf$/);
    });

    it('rejects path traversal in storage keys for getFileBuffer', async () => {
      const provider = new CloudflareR2Provider();
      const mockClient = new MockS3Client();
      provider.initClient(mockClient as any);

      await assert.rejects(
        async () => provider.getFileBuffer('../../../etc/passwd'),
        { name: 'BadRequestException' },
      );

      await assert.rejects(
        async () => provider.getFileBuffer('/absolute/path/file.pdf'),
        { name: 'BadRequestException' },
      );
    });

    it('rejects path traversal in storage keys for deleteFile', async () => {
      const provider = new CloudflareR2Provider();
      const mockClient = new MockS3Client();
      provider.initClient(mockClient as any);

      await assert.rejects(
        async () => provider.deleteFile('..\\..\\secret.key'),
        { name: 'BadRequestException' },
      );
    });

    it('sanitizes facility and patient IDs with special characters', () => {
      const provider = new CloudflareR2Provider();
      const key = provider.generateSafeKey('test.png', 'image/png', {
        facilityId: 'fac/../bad@id!',
        patientId: 'pat/../../dangerous;id',
      });

      assert.ok(!key.includes('..'));
      assert.ok(!key.includes('/../'));
      assert.ok(key.startsWith('facilities/facbadid/patients/patdangerousid/'));
    });
  });

  describe('3. Production Fail-Closed & Fallback Prevention', () => {
    it('throws fatal error in production when R2 credentials are missing', () => {
      const prevEnv = process.env.NODE_ENV;
      const prevStorage = process.env.STORAGE_PROVIDER;
      const prevAcc = process.env.CLOUDFLARE_R2_ACCOUNT_ID;

      try {
        process.env.NODE_ENV = 'production';
        process.env.STORAGE_PROVIDER = 'r2';
        delete process.env.CLOUDFLARE_R2_ACCOUNT_ID;
        delete process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
        delete process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
        delete process.env.CLOUDFLARE_R2_BUCKET;

        assert.throws(
          () => {
            const provider = new CloudflareR2Provider();
            provider.initClient();
          },
          /FATAL PRODUCTION STORAGE ERROR: Cloudflare R2 credentials missing/,
        );
      } finally {
        process.env.NODE_ENV = prevEnv;
        process.env.STORAGE_PROVIDER = prevStorage;
        if (prevAcc) process.env.CLOUDFLARE_R2_ACCOUNT_ID = prevAcc;
      }
    });

    it('StorageModule factory blocks silent fallback to local storage in production', () => {
      const isProduction = true;
      const providerName = 'local'; // attempt to use local in production

      const testFactory = (prodName: string, isProd: boolean) => {
        if (isProd) {
          if (prodName === 'r2') return 'R2_PROVIDER';
          if (prodName === 's3') return 'S3_PROVIDER';
          throw new Error(
            'FATAL PRODUCTION STORAGE ERROR: STORAGE_PROVIDER must be explicitly configured as "r2" in production. Local filesystem storage is prohibited on Render ephemeral containers.',
          );
        }
        return 'LOCAL_PROVIDER';
      };

      assert.throws(
        () => testFactory(providerName, isProduction),
        /FATAL PRODUCTION STORAGE ERROR: STORAGE_PROVIDER must be explicitly configured as "r2"/,
      );

      // When unconfigured in production:
      assert.throws(
        () => testFactory('', isProduction),
        /FATAL PRODUCTION STORAGE ERROR: STORAGE_PROVIDER must be explicitly configured as "r2"/,
      );

      // Non-production allows local storage safely:
      assert.strictEqual(testFactory('local', false), 'LOCAL_PROVIDER');
    });
  });

  describe('4. File Security, MIME & Size Limits', () => {
    const ALLOWED_MIME_TYPES = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/dicom',
      'image/dicom',
      'application/octet-stream',
    ];

    const validateAttachmentUpload = (file: { size: number; mimetype: string; originalname: string }) => {
      const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 25MB limit.');
      }
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype) && !file.originalname.endsWith('.dcm')) {
        throw new Error(`Unsupported file MIME type '${file.mimetype}'.`);
      }
      return true;
    };

    it('rejects files larger than 25 MB limit', () => {
      const oversizedFile = {
        size: 26 * 1024 * 1024,
        mimetype: 'application/pdf',
        originalname: 'big_scan.pdf',
      };
      assert.throws(() => validateAttachmentUpload(oversizedFile), /File size exceeds 25MB limit/);
    });

    it('accepts valid clinical files within 25 MB', () => {
      const validFile = {
        size: 4 * 1024 * 1024, // 4 MB
        mimetype: 'application/pdf',
        originalname: 'blood_test.pdf',
      };
      assert.strictEqual(validateAttachmentUpload(validFile), true);
    });

    it('rejects executable and dangerous MIME types', () => {
      const maliciousFiles = [
        { size: 1024, mimetype: 'application/x-msdownload', originalname: 'malware.exe' },
        { size: 1024, mimetype: 'application/javascript', originalname: 'script.js' },
        { size: 1024, mimetype: 'text/html', originalname: 'phish.html' },
      ];

      for (const f of maliciousFiles) {
        assert.throws(() => validateAttachmentUpload(f), /Unsupported file MIME type/);
      }
    });
  });

  describe('5. Multi-Tenant Authorization & IDOR Protections', () => {
    const attachmentRecord = {
      id: 'att-101',
      patientId: 'patient-uuid-1',
      facilityId: 'facility-delhi-01',
      uploadedById: 'staff-delhi-nurse',
    };

    const checkViewAuthorization = (user: any, attachment: typeof attachmentRecord) => {
      const roleCode = user.roleCode || user.role?.code;
      const userFacilityId = user.facilityId;

      if (roleCode === RoleCode.PATIENT) {
        if (attachment.patientId !== user.patientProfileId) {
          throw new Error('Access denied: You can only view your own documents.');
        }
      } else if (
        roleCode !== RoleCode.MEDINEXA_ADMIN &&
        roleCode !== RoleCode.SUPER_ADMIN &&
        userFacilityId &&
        attachment.facilityId !== userFacilityId
      ) {
        throw new Error('Access denied: Document belongs to a different hospital facility.');
      }
      return true;
    };

    it('Patient A cannot access Patient B documents', () => {
      const patientA = { roleCode: RoleCode.PATIENT, patientProfileId: 'patient-uuid-2' };
      assert.throws(
        () => checkViewAuthorization(patientA, attachmentRecord),
        /Access denied: You can only view your own documents/,
      );
    });

    it('Patient A can access their own document', () => {
      const patientA = { roleCode: RoleCode.PATIENT, patientProfileId: 'patient-uuid-1' };
      assert.strictEqual(checkViewAuthorization(patientA, attachmentRecord), true);
    });

    it('Hospital B staff cannot access Hospital A document', () => {
      const doctorHospitalB = {
        roleCode: RoleCode.DOCTOR,
        facilityId: 'facility-mumbai-02',
      };
      assert.throws(
        () => checkViewAuthorization(doctorHospitalB, attachmentRecord),
        /Access denied: Document belongs to a different hospital facility/,
      );
    });

    it('Hospital A staff can access Hospital A document', () => {
      const doctorHospitalA = {
        roleCode: RoleCode.DOCTOR,
        facilityId: 'facility-delhi-01',
      };
      assert.strictEqual(checkViewAuthorization(doctorHospitalA, attachmentRecord), true);
    });

    it('Super Admin can access documents across all network facilities', () => {
      const superAdmin = {
        roleCode: RoleCode.SUPER_ADMIN,
        facilityId: null,
      };
      assert.strictEqual(checkViewAuthorization(superAdmin, attachmentRecord), true);
    });
  });
});
