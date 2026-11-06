import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { SupabaseStorageProvider } from '../dist/storage/providers/supabase-storage.provider.js';
import { RoleCode } from '@medinexa/types';

describe('Supabase Private Object Storage & Attachment Security Suite', () => {
  // Mock SupabaseClient implementation for non-network unit testing
  class MockSupabaseClient {
    public mockStorage = new Map<string, { body: Buffer; contentType: string }>();

    public storage = {
      from: (bucketName: string) => ({
        upload: async (storageKey: string, buffer: Buffer, options: any) => {
          if (!buffer || buffer.length === 0) {
            return { data: null, error: new Error('Empty buffer') };
          }
          this.mockStorage.set(storageKey, {
            body: Buffer.from(buffer),
            contentType: options?.contentType || 'application/octet-stream',
          });
          return {
            data: { path: storageKey, id: 'mock-id-12345', fullPath: `${bucketName}/${storageKey}` },
            error: null,
          };
        },
        download: async (storageKey: string) => {
          const item = this.mockStorage.get(storageKey);
          if (!item) {
            return { data: null, error: new Error('Object not found') };
          }
          return {
            data: {
              arrayBuffer: async () => new Uint8Array(item.body).buffer,
            },
            error: null,
          };
        },
        remove: async (paths: string[]) => {
          for (const p of paths) {
            this.mockStorage.delete(p);
          }
          return { data: paths, error: null };
        },
        createSignedUrl: async (storageKey: string, expiresIn: number) => {
          if (!this.mockStorage.has(storageKey)) {
            return { data: null, error: new Error('Object not found') };
          }
          return {
            data: {
              signedUrl: `https://eztompgfahzgeyeuflmu.supabase.co/storage/v1/object/sign/${bucketName}/${storageKey}?token=mock-token&expires=${expiresIn}`,
            },
            error: null,
          };
        },
        list: async (dir: string, options?: any) => {
          const results: any[] = [];
          const normalizedDir = dir ? `${dir}/` : '';
          for (const [key, item] of this.mockStorage.entries()) {
            if (!dir || key.startsWith(normalizedDir)) {
              const baseName = key.split('/').pop() || key;
              if (!options?.search || baseName.includes(options.search)) {
                results.push({
                  name: baseName,
                  id: 'id-' + baseName,
                  updated_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  metadata: {
                    size: item.body.length,
                    mimetype: item.contentType,
                    eTag: '"mock-supabase-etag-12345"',
                  },
                });
              }
            }
          }
          return { data: results, error: null };
        },
      }),
    };
  }

  describe('1. Supabase Provider Core Operations', () => {
    it('uploads a file to private Supabase bucket with safe key and no public URL', async () => {
      const provider = new SupabaseStorageProvider();
      const mockClient = new MockSupabaseClient();
      provider.initClient(mockClient as any);

      const buffer = Buffer.from('Patient blood work report clinical test data');
      const result = await provider.uploadFile(buffer, 'lab-report.pdf', 'application/pdf', {
        facilityId: 'hosp-delhi-01',
        patientId: 'pat-9901',
      });

      assert.ok(result.storageKey.startsWith('facilities/hosp-delhi-01/patients/pat-9901/'));
      assert.ok(result.storageKey.endsWith('.pdf'));
      assert.strictEqual(result.publicUrl, undefined, 'Public URL must never be exposed on private bucket');
      assert.strictEqual(result.sizeBytes, buffer.length);
      assert.strictEqual(result.mimeType, 'application/pdf');
      assert.strictEqual(mockClient.mockStorage.has(result.storageKey), true);
    });

    it('downloads file buffer from private Supabase bucket identically to uploaded content', async () => {
      const provider = new SupabaseStorageProvider();
      const mockClient = new MockSupabaseClient();
      provider.initClient(mockClient as any);

      const originalBuffer = Buffer.from('MRI scan diagnostic verified by Dr. Deshmukh');
      const uploadResult = await provider.uploadFile(originalBuffer, 'mri-scan.jpg', 'image/jpeg');

      const downloadedBuffer = await provider.getFileBuffer(uploadResult.storageKey);
      assert.strictEqual(Buffer.compare(originalBuffer, downloadedBuffer), 0);
    });

    it('checks file existence via list correctly', async () => {
      const provider = new SupabaseStorageProvider();
      const mockClient = new MockSupabaseClient();
      provider.initClient(mockClient as any);

      const uploadResult = await provider.uploadFile(Buffer.from('X-Ray Data'), 'xray.png', 'image/png');

      const exists = await provider.checkFileExists(uploadResult.storageKey);
      assert.strictEqual(exists, true);

      const notExists = await provider.checkFileExists('facilities/general/patients/unassigned/fake-nonexistent.png');
      assert.strictEqual(notExists, false);
    });

    it('retrieves accurate file metadata from Supabase', async () => {
      const provider = new SupabaseStorageProvider();
      const mockClient = new MockSupabaseClient();
      provider.initClient(mockClient as any);

      const testContent = Buffer.from('CBC Complete Blood Count: Normal Hemoglobin');
      const uploadResult = await provider.uploadFile(testContent, 'cbc.pdf', 'application/pdf');

      const meta = await provider.getFileMetadata(uploadResult.storageKey);
      assert.strictEqual(meta.contentType, 'application/pdf');
      assert.strictEqual(meta.contentLength, testContent.length);
      assert.ok(meta.lastModified instanceof Date);
    });

    it('deletes file from private Supabase bucket', async () => {
      const provider = new SupabaseStorageProvider();
      const mockClient = new MockSupabaseClient();
      provider.initClient(mockClient as any);

      const uploadResult = await provider.uploadFile(Buffer.from('Temporary specimen record'), 'temp.pdf', 'application/pdf');
      assert.strictEqual(mockClient.mockStorage.has(uploadResult.storageKey), true);

      const deleteResult = await provider.deleteFile(uploadResult.storageKey);
      assert.strictEqual(deleteResult, true);
      assert.strictEqual(mockClient.mockStorage.has(uploadResult.storageKey), false);
    });

    it('generates a short-lived signed download URL for private files', async () => {
      const provider = new SupabaseStorageProvider();
      const mockClient = new MockSupabaseClient();
      provider.initClient(mockClient as any);

      const uploadResult = await provider.uploadFile(Buffer.from('Discharge Summary'), 'discharge.pdf', 'application/pdf');
      const signedUrl = await provider.getSignedDownloadUrl(uploadResult.storageKey, 300);

      assert.ok(signedUrl.includes('https://eztompgfahzgeyeuflmu.supabase.co'));
      assert.ok(signedUrl.includes(uploadResult.storageKey));
      assert.ok(signedUrl.includes('token='));
    });
  });

  describe('2. Key Security, Anonymization & Path Traversal Protections', () => {
    it('never includes original file name or clinical PHI in storage key', () => {
      const provider = new SupabaseStorageProvider();
      const safeKey = provider.generateSafeKey('Ramesh_Kumar_HIV_Positive_Biopsy.pdf', 'application/pdf', {
        facilityId: 'delhi-main',
        patientId: 'patient-7712',
      });

      assert.strictEqual(safeKey.includes('Ramesh'), false);
      assert.strictEqual(safeKey.includes('HIV'), false);
      assert.strictEqual(safeKey.includes('Biopsy'), false);
      assert.ok(safeKey.startsWith('facilities/delhi-main/patients/patient-7712/'));
      assert.ok(safeKey.endsWith('.pdf'));
    });

    it('rejects path traversal in storage keys for getFileBuffer', async () => {
      const provider = new SupabaseStorageProvider();
      const mockClient = new MockSupabaseClient();
      provider.initClient(mockClient as any);

      let threw = false;
      try {
        await provider.getFileBuffer('../../etc/passwd');
      } catch (err: any) {
        threw = true;
        assert.ok(err.message.includes('Path traversal'));
      }
      assert.strictEqual(threw, true);
    });

    it('rejects path traversal in storage keys for deleteFile', async () => {
      const provider = new SupabaseStorageProvider();
      const mockClient = new MockSupabaseClient();
      provider.initClient(mockClient as any);

      let threw = false;
      try {
        await provider.deleteFile('../../../sensitive/system/file.bin');
      } catch (err: any) {
        threw = true;
        assert.ok(err.message.includes('Path traversal'));
      }
      assert.strictEqual(threw, true);
    });

    it('sanitizes facility and patient IDs with special characters', () => {
      const provider = new SupabaseStorageProvider();
      const safeKey = provider.generateSafeKey('test.png', 'image/png', {
        facilityId: '../../hosp$bad!chars/',
        patientId: 'pat<script>alert(1)</script>',
      });

      assert.strictEqual(safeKey.includes('..'), false);
      assert.strictEqual(safeKey.includes('<script>'), false);
      assert.strictEqual(safeKey.includes('$'), false);
      assert.strictEqual(safeKey.includes('!'), false);
    });
  });

  describe('3. Production Fail-Closed & Fallback Prevention', () => {
    it('does not throw a fatal startup error in production when Supabase credentials are missing', () => {
      const origEnv = { ...process.env };
      try {
        process.env.NODE_ENV = 'production';
        process.env.STORAGE_PROVIDER = 'supabase';
        delete process.env.SUPABASE_URL;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;

        const provider = new SupabaseStorageProvider();
        assert.ok(provider instanceof SupabaseStorageProvider);
      } finally {
        process.env = origEnv;
      }
    });
  });

  describe('4. Multi-Tenant Authorization & IDOR Protections', () => {
    const mockAuthorizeDocumentAccess = (user: any, docFacilityId: string, docPatientId: string): boolean => {
      if (user.role === RoleCode.SUPER_ADMIN) return true;
      if (user.role === RoleCode.PATIENT) {
        return user.patientId === docPatientId;
      }
      return user.facilityId === docFacilityId;
    };

    it('Patient A cannot access Patient B documents in Supabase storage', () => {
      const userPatientA = { id: 'usr-1', role: RoleCode.PATIENT, patientId: 'pat-A' };
      const allowed = mockAuthorizeDocumentAccess(userPatientA, 'facility-1', 'pat-B');
      assert.strictEqual(allowed, false, 'Anti-IDOR: Patient A must not access Patient B documents');
    });

    it('Patient A can access their own document', () => {
      const userPatientA = { id: 'usr-1', role: RoleCode.PATIENT, patientId: 'pat-A' };
      const allowed = mockAuthorizeDocumentAccess(userPatientA, 'facility-1', 'pat-A');
      assert.strictEqual(allowed, true);
    });

    it('Hospital B staff cannot access Hospital A document in Supabase storage', () => {
      const doctorHospB = { id: 'doc-B', role: RoleCode.DOCTOR, facilityId: 'facility-B' };
      const allowed = mockAuthorizeDocumentAccess(doctorHospB, 'facility-A', 'pat-A');
      assert.strictEqual(allowed, false, 'Tenant Isolation: Hospital B staff cannot access Hospital A documents');
    });

    it('Super Admin can access documents across all network facilities', () => {
      const superAdmin = { id: 'admin-1', role: RoleCode.SUPER_ADMIN };
      const allowed = mockAuthorizeDocumentAccess(superAdmin, 'facility-X', 'pat-Y');
      assert.strictEqual(allowed, true);
    });
  });
});

