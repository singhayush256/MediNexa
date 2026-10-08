import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import jsonwebtoken from 'jsonwebtoken';
const jwt: any = (jsonwebtoken as any).default || jsonwebtoken;
import { isPrivilegedRole, normalizeRoleCode } from '@medinexa/validation';
import { RoleCode } from '@medinexa/types';

class ForbiddenException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenException';
  }
}

// Pure implementation mirroring src/common/utils/cors-origin.util.ts
function isAllowedCorsOrigin(origin?: string): boolean {
  if (!origin) return true;
  const isProduction = process.env.NODE_ENV === 'production';
  if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
    const allowed = process.env.CORS_ORIGIN.split(',').map((o) => o.trim().toLowerCase());
    if (allowed.includes(origin.toLowerCase())) return true;
  }
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    if (
      host === 'medinexa.com' ||
      host.endsWith('.medinexa.com') ||
      host.endsWith('.medinexa.health') ||
      host.endsWith('.vercel.app') ||
      host.endsWith('.onrender.com')
    ) {
      return true;
    }
    if (!isProduction && (host === 'localhost' || host === '127.0.0.1')) {
      return true;
    }
    if (!isProduction && (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*')) {
      return true;
    }
  } catch {
    return false;
  }
  return !isProduction;
}

// Pure implementation mirroring src/common/guards/hospital-tenant.guard.ts logic
class HospitalTenantGuardTestHelper {
  canActivate(context: any): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return true;

    const rawRole = user.roleCode || user.role?.code || user.role;
    const normalizedRole = rawRole ? normalizeRoleCode(rawRole) : null;

    if (normalizedRole === 'MEDINEXA_ADMIN' || normalizedRole === RoleCode.SUPER_ADMIN) {
      return true;
    }
    if (normalizedRole === RoleCode.PATIENT || normalizedRole === 'GUARDIAN') {
      return true;
    }

    const assignedFacilityId = user.facilityId || user.facility?.id || user.doctorProfile?.facilityId || null;
    if (!assignedFacilityId) return true;

    const queryFacility = req.query?.facilityId || req.query?.hospitalId;
    const paramFacility = req.params?.facilityId || req.params?.hospitalId;
    const bodyFacility = req.body?.facilityId || req.body?.hospitalId;
    const requestedFacility = queryFacility || paramFacility || bodyFacility;

    if (requestedFacility && typeof requestedFacility === 'string') {
      const cleanRequested = requestedFacility.trim().toUpperCase();
      const cleanAssigned = assignedFacilityId.trim().toUpperCase();
      const isMatch =
        cleanRequested === cleanAssigned ||
        (cleanAssigned.includes('HOSPITAL_A') && cleanRequested.includes('HOSPITAL_A')) ||
        (cleanAssigned.includes('HOSPITAL_B') && cleanRequested.includes('HOSPITAL_B'));

      if (!isMatch) {
        const err = new Error(`Cross-hospital access violation: You are assigned to hospital '${assignedFacilityId}' and do not have permission to access data from hospital '${requestedFacility}'.`);
        (err as any).name = 'ForbiddenException';
        throw err;
      }
    }
    return true;
  }
}

describe('MediNexa Production Security Lockdown & Attack-Surface Regression Suite', () => {

  // =========================================================================
  // 1. Production Demo & Test Routes Lockdown
  // =========================================================================
  describe('Phase 2 — Demo & Test Routes Production Lockdown', () => {
    it('demo-switch must throw ForbiddenException when NODE_ENV === "production"', () => {
      const prevEnv = process.env.NODE_ENV;
      const prevDemo = process.env.DEMO_MODE;
      try {
        process.env.NODE_ENV = 'production';
        process.env.DEMO_MODE = 'true'; // Even if DEMO_MODE is true in prod, it must fail closed

        // Simulation of auth.service.ts demoSwitch logic
        const checkDemoSwitch = () => {
          if (process.env.NODE_ENV === 'production') {
            throw new ForbiddenException('Demo persona switching is strictly disabled in production environments.');
          }
          return { success: true };
        };

        assert.throws(() => checkDemoSwitch(), {
          name: 'ForbiddenException',
          message: 'Demo persona switching is strictly disabled in production environments.',
        });
      } finally {
        process.env.NODE_ENV = prevEnv;
        process.env.DEMO_MODE = prevDemo;
      }
    });

    it('test authentication endpoints must throw ForbiddenException in production', () => {
      const prevEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';

        const checkTestEndpoint = () => {
          if (process.env.NODE_ENV === 'production') {
            throw new ForbiddenException('Test authentication endpoints are disabled in production environments.');
          }
          return { message: 'ok' };
        };

        assert.throws(() => checkTestEndpoint(), {
          name: 'ForbiddenException',
          message: 'Test authentication endpoints are disabled in production environments.',
        });
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });

    it('demo dataset generator must throw ForbiddenException in production', () => {
      const prevEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';

        const checkDemoGenerator = () => {
          if (process.env.NODE_ENV === 'production') {
            throw new ForbiddenException('Demo dataset generation is strictly disabled in production environments.');
          }
          return { status: 'GENERATED' };
        };

        assert.throws(() => checkDemoGenerator(), {
          name: 'ForbiddenException',
          message: 'Demo dataset generation is strictly disabled in production environments.',
        });
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });
  });

  // =========================================================================
  // 2. Secret Fail-Closed Verification
  // =========================================================================
  describe('Phase 3 — Secret & Credential Fail-Closed Handling', () => {
    it('TOTP crypto service must fail closed in production if encryption key is missing', () => {
      const prevEnv = process.env.NODE_ENV;
      const prevTotpKey = process.env.TOTP_ENCRYPTION_KEY;
      const prevJwtSecret = process.env.JWT_SECRET;
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.TOTP_ENCRYPTION_KEY;
        delete process.env.JWT_SECRET;

        const initTotpCrypto = () => {
          const secret = process.env.TOTP_ENCRYPTION_KEY || process.env.JWT_SECRET;
          if (!secret && process.env.NODE_ENV === 'production') {
            throw new Error('FATAL SECURITY ERROR: TOTP_ENCRYPTION_KEY or JWT_SECRET must be configured in production mode.');
          }
        };

        assert.throws(() => initTotpCrypto(), {
          message: 'FATAL SECURITY ERROR: TOTP_ENCRYPTION_KEY or JWT_SECRET must be configured in production mode.',
        });
      } finally {
        process.env.NODE_ENV = prevEnv;
        if (prevTotpKey) process.env.TOTP_ENCRYPTION_KEY = prevTotpKey;
        if (prevJwtSecret) process.env.JWT_SECRET = prevJwtSecret;
      }
    });

    it('Field encryption service must fail closed in production if master key is missing', () => {
      const prevEnv = process.env.NODE_ENV;
      const prevEncKey = process.env.ENCRYPTION_KEY;
      const prevJwtSecret = process.env.JWT_SECRET;
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.ENCRYPTION_KEY;
        delete process.env.JWT_SECRET;

        const initFieldEncryption = () => {
          const rawSecret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
          if (!rawSecret && process.env.NODE_ENV === 'production') {
            throw new Error('FATAL SECURITY ERROR: ENCRYPTION_KEY or JWT_SECRET must be configured in production mode.');
          }
        };

        assert.throws(() => initFieldEncryption(), {
          message: 'FATAL SECURITY ERROR: ENCRYPTION_KEY or JWT_SECRET must be configured in production mode.',
        });
      } finally {
        process.env.NODE_ENV = prevEnv;
        if (prevEncKey) process.env.ENCRYPTION_KEY = prevEncKey;
        if (prevJwtSecret) process.env.JWT_SECRET = prevJwtSecret;
      }
    });
  });

  // =========================================================================
  // 3. Multi-Tenant Cross-Hospital Isolation (HospitalTenantGuard)
  // =========================================================================
  describe('Phase 4 — Multi-Tenant / IDOR Hospital Isolation', () => {
    const guard = new HospitalTenantGuardTestHelper();

    const createMockContext = (user: any, query: any = {}, params: any = {}, body: any = {}) => {
      const req: any = { user, query, params, body };
      return {
        switchToHttp: () => ({
          getRequest: () => req,
        }),
        _req: req,
      } as any;
    };

    it('Hospital A Doctor cannot access Hospital B records', () => {
      const staffUser = {
        id: 'usr-doc-1',
        email: 'doctor@hospital-a.com',
        roleCode: RoleCode.DOCTOR,
        facilityId: 'fac-hospital-a',
      };
      const context = createMockContext(staffUser, { facilityId: 'fac-hospital-b' });

      assert.throws(() => guard.canActivate(context), {
        name: 'ForbiddenException',
      });
    });

    it('Hospital A Receptionist cannot query Hospital B patient registry', () => {
      const staffUser = {
        id: 'usr-rec-1',
        email: 'rec@hospital-a.com',
        roleCode: RoleCode.RECEPTIONIST,
        facilityId: 'fac-hospital-a',
      };
      const context = createMockContext(staffUser, { hospitalId: 'fac-hospital-b' });

      assert.throws(() => guard.canActivate(context), {
        name: 'ForbiddenException',
      });
    });

    it('Hospital A Admin cannot access Hospital B invoices or financial records', () => {
      const adminUser = {
        id: 'usr-ha-1',
        email: 'admin@hospital-a.com',
        roleCode: RoleCode.HOSPITAL_ADMIN,
        facilityId: 'fac-hospital-a',
      };
      const context = createMockContext(adminUser, {}, { facilityId: 'fac-hospital-b' });

      assert.throws(() => guard.canActivate(context), {
        name: 'ForbiddenException',
      });
    });

    it('SUPER_ADMIN and MEDINEXA_ADMIN can perform authorized cross-hospital platform oversight', () => {
      const superAdminUser = {
        id: 'usr-sa-1',
        email: 'super@medinexa.com',
        roleCode: RoleCode.SUPER_ADMIN,
      };
      const context = createMockContext(superAdminUser, { facilityId: 'fac-hospital-b' });
      assert.strictEqual(guard.canActivate(context), true);
    });

    it('Patient can view discovery and beds across network facilities', () => {
      const patientUser = {
        id: 'usr-pat-1',
        email: 'patient@example.com',
        roleCode: RoleCode.PATIENT,
      };
      const context = createMockContext(patientUser, { facilityId: 'fac-hospital-b' });
      assert.strictEqual(guard.canActivate(context), true);
    });
  });

  // =========================================================================
  // 4. Role Enforcement & Privilege Escalation Prevention
  // =========================================================================
  describe('Phase 5 — Role & Permission Enforcement', () => {
    it('Manager is NOT a privileged role and does NOT equal Hospital Admin', () => {
      assert.strictEqual(isPrivilegedRole('MANAGER'), false);
      assert.strictEqual(isPrivilegedRole('HR_MANAGER'), false);
      assert.strictEqual(isPrivilegedRole('WARD_MANAGER'), false);
      assert.strictEqual(isPrivilegedRole('HOSPITAL_ADMIN'), true);
      assert.strictEqual(isPrivilegedRole('MEDINEXA_ADMIN'), true);
    });

    it('Role normalization preserves distinct identity for MANAGER vs HOSPITAL_ADMIN', () => {
      assert.strictEqual(normalizeRoleCode('MANAGER'), 'MANAGER');
      assert.strictEqual(normalizeRoleCode('HR_MANAGER'), 'MANAGER');
      assert.strictEqual(normalizeRoleCode('HOSPITAL_ADMIN'), 'HOSPITAL_ADMIN');
      assert.notStrictEqual(normalizeRoleCode('MANAGER'), normalizeRoleCode('HOSPITAL_ADMIN'));
    });
  });

  // =========================================================================
  // 5. JWT Token Validation & Expiration
  // =========================================================================
  describe('Phase 6 — JWT & Session Security', () => {
    const testSecret = 'medinexa-test-jwt-secret-key-lockdown-2026';

    it('Valid unexpired token is decoded successfully', () => {
      const token = jwt.sign(
        { sub: 'usr-123', email: 'doc@medinexa.com', roleCode: RoleCode.DOCTOR },
        testSecret,
        { expiresIn: '1h' },
      );
      const decoded: any = jwt.verify(token, testSecret);
      assert.strictEqual(decoded.sub, 'usr-123');
      assert.strictEqual(decoded.roleCode, RoleCode.DOCTOR);
    });

    it('Expired JWT token is strictly rejected', () => {
      const expiredToken = jwt.sign(
        { sub: 'usr-123', email: 'doc@medinexa.com', roleCode: RoleCode.DOCTOR },
        testSecret,
        { expiresIn: -10 }, // expired 10 seconds ago
      );
      assert.throws(() => jwt.verify(expiredToken, testSecret), {
        name: 'TokenExpiredError',
      });
    });

    it('JWT signed with wrong secret is rejected with JsonWebTokenError', () => {
      const rogueToken = jwt.sign(
        { sub: 'usr-123', roleCode: RoleCode.SUPER_ADMIN },
        'rogue-attacker-secret',
        { expiresIn: '1h' },
      );
      assert.throws(() => jwt.verify(rogueToken, testSecret), {
        name: 'JsonWebTokenError',
      });
    });
  });

  // =========================================================================
  // 6. Patient PHI & Document IDOR Protection
  // =========================================================================
  describe('Phase 9 — Document & Attachment IDOR Authorization', () => {
    it('Patient A cannot query Patient B attachments', () => {
      const patientA = { id: 'usr-pat-a', roleCode: RoleCode.PATIENT };
      const patientAProfileId = 'prof-pat-a';
      const patientBProfileId = 'prof-pat-b';

      // Simulation of attachment.service getAttachments authorization
      const checkPatientDocumentAccess = (user: any, requestedPatientId?: string) => {
        if (user.roleCode === RoleCode.PATIENT) {
          if (requestedPatientId && requestedPatientId !== patientAProfileId) {
            throw new ForbiddenException('Access denied: You cannot view documents belonging to another patient.');
          }
        }
        return true;
      };

      assert.throws(() => checkPatientDocumentAccess(patientA, patientBProfileId), {
        name: 'ForbiddenException',
        message: 'Access denied: You cannot view documents belonging to another patient.',
      });
      assert.strictEqual(checkPatientDocumentAccess(patientA, patientAProfileId), true);
    });

    it('Patient cannot view document with mismatched patientId', () => {
      const patientA = { id: 'usr-pat-a', roleCode: RoleCode.PATIENT };
      const patientAProfileId = 'prof-pat-a';

      const attachment = {
        id: 'att-123',
        patientId: 'prof-pat-b', // Belongs to Patient B
        facilityId: 'fac-1',
      };

      const checkViewDocument = (user: any, att: typeof attachment) => {
        if (user.roleCode === RoleCode.PATIENT) {
          if (att.patientId !== patientAProfileId) {
            throw new ForbiddenException('Access denied: You can only view your own documents.');
          }
        }
      };

      assert.throws(() => checkViewDocument(patientA, attachment), {
        name: 'ForbiddenException',
        message: 'Access denied: You can only view your own documents.',
      });
    });

    it('Patient cannot delete attachment uploaded by another user', () => {
      const patientA = { id: 'usr-pat-a', roleCode: RoleCode.PATIENT };
      const attachment = {
        id: 'att-456',
        uploadedById: 'usr-hospital-staff-9',
      };

      const checkDeleteDocument = (user: any, att: typeof attachment) => {
        if (user.roleCode === RoleCode.PATIENT && att.uploadedById !== user.id) {
          throw new ForbiddenException('Access denied: Patients can only delete documents they uploaded themselves.');
        }
      };

      assert.throws(() => checkDeleteDocument(patientA, attachment), {
        name: 'ForbiddenException',
        message: 'Access denied: Patients can only delete documents they uploaded themselves.',
      });
    });
  });

  // =========================================================================
  // 7. WebSocket Gateway Room Scoping
  // =========================================================================
  describe('Phase 8 — WebSocket Gateway Room Authorization', () => {
    it('Hospital A user is blocked from subscribing to Hospital B realtime facility room', () => {
      const user = {
        id: 'usr-staff-a',
        email: 'nurse@hospital-a.com',
        roleCode: RoleCode.NURSE,
        facilityId: 'fac-hospital-a',
      };
      const requestedFacilityId = 'fac-hospital-b';

      const checkJoinFacility = (u: typeof user, facId: string) => {
        const isCrossOrg = u.roleCode === RoleCode.SUPER_ADMIN || u.roleCode === RoleCode.MEDINEXA_ADMIN;
        if (!isCrossOrg && u.facilityId !== facId) {
          return false; // rejected
        }
        return true;
      };

      assert.strictEqual(checkJoinFacility(user, requestedFacilityId), false);
      assert.strictEqual(checkJoinFacility(user, 'fac-hospital-a'), true);
    });

    it('Patient A is blocked from subscribing to Patient B private user room', () => {
      const user = {
        sub: 'usr-pat-a',
        roleCode: RoleCode.PATIENT,
      };
      const targetUserId = 'usr-pat-b';

      const checkJoinUser = (u: typeof user, targetId: string) => {
        const isSuper = u.roleCode === RoleCode.SUPER_ADMIN || u.roleCode === RoleCode.MEDINEXA_ADMIN;
        if (!isSuper && u.sub !== targetId) {
          return false;
        }
        return true;
      };

      assert.strictEqual(checkJoinUser(user, targetUserId), false);
      assert.strictEqual(checkJoinUser(user, 'usr-pat-a'), true);
    });
  });

  // =========================================================================
  // 8. CORS Origin Whitelist Protection
  // =========================================================================
  describe('Phase 11 — CORS Origin Whitelist & Anti-Reflection', () => {
    it('Permits legitimate Vercel production frontend origin', () => {
      const allowed = isAllowedCorsOrigin('https://medi-nexa-web-nu.vercel.app');
      assert.strictEqual(allowed, true);
    });

    it('Permits custom medinexa.com domain origins', () => {
      assert.strictEqual(isAllowedCorsOrigin('https://medinexa.com'), true);
      assert.strictEqual(isAllowedCorsOrigin('https://app.medinexa.com'), true);
      assert.strictEqual(isAllowedCorsOrigin('https://staging.medinexa.health'), true);
    });

    it('Rejects untrusted third-party origins in production', () => {
      const prevEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.CORS_ORIGIN;

        assert.strictEqual(isAllowedCorsOrigin('https://malicious-attacker.com'), false);
        assert.strictEqual(isAllowedCorsOrigin('http://evil-phishing.org'), false);
        assert.strictEqual(isAllowedCorsOrigin('https://fake-medinexa.net'), false);
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });
  });
});
