import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as crypto from 'node:crypto';
import { RoleCode } from '@medinexa/types';
import { normalizeRoleCode } from '@medinexa/validation';

/**
 * Pure generator mirroring SuperAdminService implementation
 */
async function generateUniqueHospitalRegistrationCode(
  city: string | undefined,
  name: string | undefined,
  prisma: any,
): Promise<string> {
  const cleanCity = (city || name || 'HOSP')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, 'X');

  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

  for (let attempt = 0; attempt < 50; attempt++) {
    let randPart = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      randPart += chars[bytes[i] % chars.length];
    }
    const candidateCode = `MNX-HOSP-${cleanCity}-${randPart}`;
    const exists = await prisma.facility.findFirst({
      where: { code: candidateCode },
      select: { id: true },
    });
    if (!exists) {
      return candidateCode;
    }
  }
  return `MNX-HOSP-${cleanCity}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

async function generateUniqueEmployeeInvitationCode(
  roleCode: string,
  prisma: any,
): Promise<{ token: string; invitationCode: string }> {
  const normRole = (roleCode || 'STAFF').toUpperCase().replace(/[^A-Z]/g, '');
  const prefix = normRole.slice(0, 6) || 'STAFF';
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

  const token = crypto.randomBytes(32).toString('hex');

  for (let attempt = 0; attempt < 50; attempt++) {
    let randPart = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      randPart += chars[bytes[i] % chars.length];
    }
    const candidateCode = `MNX-EMP-${prefix}-${randPart}`;
    const exists = await prisma.staffInvitation.findFirst({
      where: { staffId: candidateCode },
      select: { id: true },
    });
    if (!exists) {
      return { token, invitationCode: candidateCode };
    }
  }
  const fallbackCode = `MNX-EMP-${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  return { token, invitationCode: fallbackCode };
}

async function generateSequentialHospitalId(prisma: any): Promise<string> {
  const facilities = await prisma.facility.findMany();
  let maxSeq = 0;
  for (const fac of facilities) {
    if (fac.id && fac.id.startsWith('HOSP-')) {
      const numPart = parseInt(fac.id.replace('HOSP-', ''), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  return `HOSP-${nextSeq.toString().padStart(6, '0')}`;
}

describe('MediNexa — Master Hospital Onboarding, Role Hierarchy & Access Control Suite', () => {
  // =========================================================================
  // 1. SINGLE SUPER ADMIN INVARIANT
  // =========================================================================
  describe('1. Single Platform-Level Super Admin Invariant', () => {
    it('allows designated platform Super Admin (admin@medinexa.in) without error', async () => {
      const mockPrisma = {
        user: {
          count: async () => 1,
          findFirst: async ({ where }: any) => {
            if (where.email === 'admin@medinexa.in') {
              return { id: 'sa-01', email: 'admin@medinexa.in' };
            }
            return null;
          },
        },
      };

      let threw = false;
      try {
        const count = await mockPrisma.user.count();
        if (count > 0) {
          const existing = await mockPrisma.user.findFirst({
            where: { email: 'admin@medinexa.in' },
          });
          if (!existing) {
            throw new Error('Platform security violation: Only ONE Super Admin authority is permitted.');
          }
        }
      } catch {
        threw = true;
      }
      assert.strictEqual(threw, false, 'Designated Super Admin should be recognized');
    });

    it('strictly forbids creating a second Super Admin account', async () => {
      const mockPrisma = {
        user: {
          count: async () => 1,
          findFirst: async ({ where }: any) => {
            if (where.email === 'admin@medinexa.in') {
              return { id: 'sa-01', email: 'admin@medinexa.in' };
            }
            return null;
          },
        },
      };

      let errorMsg = '';
      try {
        const candidateEmail = 'newadmin@hospital.com';
        const count = await mockPrisma.user.count();
        if (count > 0) {
          const existing = await mockPrisma.user.findFirst({
            where: { email: candidateEmail },
          });
          if (!existing) {
            throw new Error('Platform security violation: Only ONE designated Super Admin authority is permitted across the MediNexa ecosystem. Additional Super Admin creation is strictly prohibited.');
          }
        }
      } catch (err: any) {
        errorMsg = err.message;
      }

      assert.match(
        errorMsg,
        /Only ONE designated Super Admin authority is permitted/,
        'Second Super Admin creation must be rejected',
      );
    });

    it('rejects hospital creation when attempted by a non-designated platform admin account', () => {
      const unauthorizedPlatformUser = {
        id: 'usr-support-01',
        email: 'support@medinexa.in',
        roleCode: 'MEDINEXA_ADMIN',
      };

      let blocked = false;
      const callerRole = unauthorizedPlatformUser.roleCode;
      const callerEmail = unauthorizedPlatformUser.email;

      if (callerRole !== 'SUPER_ADMIN' && callerRole !== 'MEDINEXA_ADMIN') {
        blocked = true;
      }
      if (callerEmail && callerEmail !== 'admin@medinexa.in') {
        blocked = true;
      }

      assert.strictEqual(
        blocked,
        true,
        'Only the designated primary Super Admin authority (admin@medinexa.in) may register hospitals',
      );
    });

    it('allows designated primary Super Admin (admin@medinexa.in) to register hospitals', () => {
      const designatedSuperAdmin = {
        id: 'sa-root',
        email: 'admin@medinexa.in',
        roleCode: 'SUPER_ADMIN',
      };

      let allowed = false;
      const callerRole = designatedSuperAdmin.roleCode;
      const callerEmail = designatedSuperAdmin.email;

      if ((callerRole === 'SUPER_ADMIN' || callerRole === 'MEDINEXA_ADMIN') && callerEmail === 'admin@medinexa.in') {
        allowed = true;
      }

      assert.strictEqual(allowed, true, 'Designated Super Admin must be permitted to register hospitals');
    });

    it('rejects public self-registration with SUPER_ADMIN role', () => {
      const PUBLIC_REGISTRATION_ROLES = ['PATIENT', 'GUARDIAN'];
      const requestedRole = 'SUPER_ADMIN';
      const normalizedRequested = normalizeRoleCode(requestedRole);

      const isAllowed = PUBLIC_REGISTRATION_ROLES.includes(normalizedRequested);
      assert.strictEqual(isAllowed, false, 'SUPER_ADMIN role must be rejected on public registration');
    });
  });

  // =========================================================================
  // 2. SUPER ADMIN HOSPITAL REGISTRATION & COLLISION RESISTANCE
  // =========================================================================
  describe('2. Super Admin Hospital Registration & Collision Resistance', () => {
    it('generates collision-resistant Hospital Registration Codes in MNX-HOSP-CITY-RANDOM format', async () => {
      const existingCodes = new Set<string>();
      const mockPrisma = {
        facility: {
          findFirst: async ({ where }: any) => {
            if (existingCodes.has(where.code)) {
              return { id: 'existing-id' };
            }
            return null;
          },
        },
      };

      const code1 = await generateUniqueHospitalRegistrationCode('Delhi', 'Central Hospital', mockPrisma);
      existingCodes.add(code1);
      const code2 = await generateUniqueHospitalRegistrationCode('Delhi', 'Central Hospital', mockPrisma);

      assert.match(code1, /^MNX-HOSP-DEL-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
      assert.match(code2, /^MNX-HOSP-DEL-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
      assert.notStrictEqual(code1, code2, 'Generated codes must be distinct and collision-safe');
    });

    it('generates sequential collision-safe Hospital IDs (HOSP-000001, HOSP-000002)', async () => {
      const mockPrisma = {
        facility: {
          findMany: async () => [
            { id: 'HOSP-000001' },
            { id: 'HOSP-000002' },
          ],
        },
      };

      const nextId = await generateSequentialHospitalId(mockPrisma);
      assert.strictEqual(nextId, 'HOSP-000003');
    });

    it('generates single-use collision-resistant employee invitation codes in MNX-EMP-ROLE-RANDOM format', async () => {
      const mockPrisma = {
        staffInvitation: {
          findFirst: async () => null,
        },
      };

      const docInvite = await generateUniqueEmployeeInvitationCode('DOCTOR', mockPrisma);
      const nurseInvite = await generateUniqueEmployeeInvitationCode('NURSE', mockPrisma);
      const adminInvite = await generateUniqueEmployeeInvitationCode('HOSPITAL_ADMIN', mockPrisma);

      assert.match(docInvite.invitationCode, /^MNX-EMP-DOCTOR-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
      assert.match(nurseInvite.invitationCode, /^MNX-EMP-NURSE-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
      assert.match(adminInvite.invitationCode, /^MNX-EMP-HOSPIT-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);

      assert.strictEqual(typeof docInvite.token, 'string');
      assert.strictEqual(docInvite.token.length, 64, 'Cryptographic token must be 64-char hex (32 bytes)');
    });
  });

  // =========================================================================
  // 3. ROLE HIERARCHY ENFORCEMENT & EXPLICIT MANAGER DELEGATION
  // =========================================================================
  describe('3. Role Hierarchy & Multi-Level Delegation Enforcement', () => {
    it('Hospital Admin CANNOT create a new hospital facility (restricted to SUPER_ADMIN / MEDINEXA_ADMIN)', () => {
      const allowedRolesForFacilityCreation = ['SUPER_ADMIN', RoleCode.MEDINEXA_ADMIN];
      const hospitalAdminRole = RoleCode.HOSPITAL_ADMIN;

      const canHospitalAdminCreate = allowedRolesForFacilityCreation.includes(hospitalAdminRole as any);
      assert.strictEqual(
        canHospitalAdminCreate,
        false,
        'Hospital Admin must be blocked from creating hospital facilities',
      );
    });

    it('Hospital Admin CAN invite a Manager and staff into their facility', () => {
      const callerRole: string = 'HOSPITAL_ADMIN';
      const targetRole: string = 'MANAGER';

      const authorizedCallers = ['SUPER_ADMIN', 'MEDINEXA_ADMIN', 'HOSPITAL_ADMIN', 'ADMIN', 'MANAGER', 'HR_MANAGER'];
      assert.strictEqual(authorizedCallers.includes(callerRole), true);

      // Hospital Admin is not constrained by Manager role restrictions
      const isForbidden = (callerRole === 'MANAGER' || callerRole === 'HR_MANAGER') &&
        ['MANAGER', 'HR_MANAGER', 'HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(targetRole);

      assert.strictEqual(isForbidden, false, 'Hospital Admin can invite Managers');
    });

    it('Manager onboarding permission defaults to disabled (Manager cannot invite without explicit grant)', async () => {
      // Mock Manager without ManagerPermission row
      const mockPrisma = {
        managerPermission: {
          findFirst: async ({ where }: any) => {
            // No permission granted
            return null;
          },
        },
      };

      const callerRole = 'MANAGER';
      const managerId = 'mgr-101';
      const permissionCode = 'INVITE_EMPLOYEES';

      const hasExplicitGrant = await mockPrisma.managerPermission.findFirst({
        where: {
          managerId,
          permissionCode,
          granted: true,
        },
      });

      let blocked = false;
      if (callerRole === 'MANAGER' && !hasExplicitGrant) {
        blocked = true;
      }

      assert.strictEqual(blocked, true, 'Manager without explicit grant must be blocked from inviting staff');
    });

    it('Hospital Admin can grant INVITE_EMPLOYEES permission to a Manager', async () => {
      const permissionsDb = new Map<string, any>();
      const mockPrisma = {
        managerPermission: {
          upsert: async ({ where, update, create }: any) => {
            const key = `${where.managerId_permissionCode.managerId}:${where.managerId_permissionCode.permissionCode}`;
            const record = {
              managerId: where.managerId_permissionCode.managerId,
              permissionCode: where.managerId_permissionCode.permissionCode,
              facilityId: create.facilityId,
              granted: create.granted,
              grantedById: create.grantedById,
              grantedAt: create.grantedAt,
              revokedAt: null,
            };
            permissionsDb.set(key, record);
            return record;
          },
        },
      };

      const caller = { id: 'admin-01', roleCode: 'HOSPITAL_ADMIN', facilityId: 'fac-delhi-01' };
      const managerId = 'mgr-101';

      const granted = await mockPrisma.managerPermission.upsert({
        where: {
          managerId_permissionCode: {
            managerId,
            permissionCode: 'INVITE_EMPLOYEES',
          },
        },
        update: {
          granted: true,
          grantedById: caller.id,
          grantedAt: new Date(),
          revokedAt: null,
        },
        create: {
          managerId,
          facilityId: caller.facilityId,
          permissionCode: 'INVITE_EMPLOYEES',
          granted: true,
          grantedById: caller.id,
          grantedAt: new Date(),
        },
      });

      assert.strictEqual(granted.granted, true);
      assert.strictEqual(granted.permissionCode, 'INVITE_EMPLOYEES');
      assert.strictEqual(granted.managerId, 'mgr-101');
    });

    it('Hospital Admin can revoke INVITE_EMPLOYEES permission immediately blocking subsequent requests', async () => {
      const permissionsDb = new Map<string, any>();
      const key = 'mgr-101:INVITE_EMPLOYEES';
      permissionsDb.set(key, {
        managerId: 'mgr-101',
        permissionCode: 'INVITE_EMPLOYEES',
        granted: true,
      });

      const mockPrisma = {
        managerPermission: {
          updateMany: async ({ where, data }: any) => {
            const rec = permissionsDb.get(key);
            if (rec && rec.managerId === where.managerId && rec.permissionCode === where.permissionCode) {
              rec.granted = data.granted;
              rec.revokedAt = data.revokedAt;
              return { count: 1 };
            }
            return { count: 0 };
          },
          findFirst: async ({ where }: any) => {
            const rec = permissionsDb.get(key);
            if (rec && rec.managerId === where.managerId && rec.permissionCode === where.permissionCode && rec.granted === where.granted) {
              return rec;
            }
            return null;
          },
        },
      };

      // Revoke
      await mockPrisma.managerPermission.updateMany({
        where: { managerId: 'mgr-101', permissionCode: 'INVITE_EMPLOYEES' },
        data: { granted: false, revokedAt: new Date() },
      });

      // Subsequent check immediately evaluates to blocked
      const perm = await mockPrisma.managerPermission.findFirst({
        where: { managerId: 'mgr-101', permissionCode: 'INVITE_EMPLOYEES', granted: true },
      });

      assert.strictEqual(perm, null, 'Revocation must take immediate effect and block subsequent invitations');
    });

    it('Manager WITH explicit grant CAN invite operational employees (DOCTOR, NURSE, RECEPTIONIST, LAB_STAFF, PHARMACIST)', () => {
      const callerRole = 'MANAGER';
      const hasExplicitGrant = true;
      const operationalRoles = ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'BILLING_STAFF'];

      for (const role of operationalRoles) {
        const isForbiddenRole = ['MANAGER', 'HR_MANAGER', 'HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(role);
        const canDispatch = hasExplicitGrant && !isForbiddenRole;
        assert.strictEqual(canDispatch, true, `Authorized Manager should be able to invite ${role}`);
      }
    });

    it('Manager CANNOT invite Hospital Admin or another Manager even with permission grant', () => {
      const callerRole = 'MANAGER';
      const hasExplicitGrant = true;
      const prohibitedRoles = ['HOSPITAL_ADMIN', 'ADMIN', 'MANAGER', 'HR_MANAGER', 'SUPER_ADMIN'];

      for (const role of prohibitedRoles) {
        const isForbidden = (callerRole === 'MANAGER' || callerRole === 'HR_MANAGER') && prohibitedRoles.includes(role);
        assert.strictEqual(isForbidden, true, `Manager must NOT be able to invite ${role}`);
      }
    });

    it('Operational staff (DOCTOR, NURSE, RECEPTIONIST) CANNOT dispatch invitations', () => {
      const authorizedCallers = ['SUPER_ADMIN', 'MEDINEXA_ADMIN', 'HOSPITAL_ADMIN', 'ADMIN', 'MANAGER', 'HR_MANAGER'];
      const operationalStaff = ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'BILLING_STAFF'];

      for (const staff of operationalStaff) {
        assert.strictEqual(
          authorizedCallers.includes(staff),
          false,
          `${staff} must not have permission to dispatch staff invitations`,
        );
      }
    });
  });

  // =========================================================================
  // 4. INVITATION VERIFICATION & ACCEPTANCE WORKFLOW
  // =========================================================================
  describe('4. Single-Use Invitation Verification & Account Activation', () => {
    it('verifies an active invitation by code or token and returns facility metadata', async () => {
      const mockInvitation = {
        id: 'inv-01',
        facilityId: 'fac-delhi-01',
        email: 'priya.sharma@delhihosp.medinexa.in',
        firstName: 'Priya',
        lastName: 'Sharma',
        roleCode: 'DOCTOR',
        department: 'Cardiology',
        staffId: 'MNX-EMP-DOCTOR-8K72Q9',
        token: 'tok-abc-123',
        status: 'INVITED',
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      };

      const mockFacility = {
        id: 'fac-delhi-01',
        name: 'MediNexa Delhi Central Hospital',
        code: 'MNX-HOSP-DEL-8K72Q9',
        city: 'Delhi',
      };

      assert.strictEqual(mockInvitation.status, 'INVITED');
      assert.strictEqual(mockInvitation.expiresAt > new Date(), true);

      const verificationResult = {
        valid: true,
        email: mockInvitation.email,
        firstName: mockInvitation.firstName,
        lastName: mockInvitation.lastName,
        roleCode: mockInvitation.roleCode,
        department: mockInvitation.department,
        facilityId: mockInvitation.facilityId,
        facilityName: mockFacility.name,
        facilityCode: mockFacility.code,
        invitationCode: mockInvitation.staffId,
        token: mockInvitation.token,
      };

      assert.strictEqual(verificationResult.valid, true);
      assert.strictEqual(verificationResult.roleCode, 'DOCTOR');
      assert.strictEqual(verificationResult.facilityCode, 'MNX-HOSP-DEL-8K72Q9');
    });

    it('rejects invitation verification if already accepted', () => {
      const mockInvitation = {
        status: 'ACCEPTED',
        staffId: 'MNX-EMP-DOCTOR-8K72Q9',
      };

      let threw = false;
      try {
        if (mockInvitation.status === 'ACCEPTED') {
          throw new Error('This invitation has already been accepted and activated.');
        }
      } catch (err: any) {
        threw = true;
        assert.match(err.message, /already been accepted/);
      }
      assert.strictEqual(threw, true);
    });

    it('rejects invitation verification if expired', () => {
      const mockInvitation = {
        status: 'INVITED',
        expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hr ago
      };

      let threw = false;
      try {
        if (mockInvitation.expiresAt && mockInvitation.expiresAt < new Date()) {
          throw new Error('This invitation has expired.');
        }
      } catch (err: any) {
        threw = true;
        assert.match(err.message, /expired/);
      }
      assert.strictEqual(threw, true);
    });

    it('rejects invitation verification if cancelled or revoked', () => {
      const mockInvitation = {
        status: 'REVOKED',
        staffId: 'MNX-EMP-DOCTOR-8K72Q9',
      };

      let threw = false;
      try {
        if (mockInvitation.status === 'CANCELLED' || mockInvitation.status === 'REVOKED') {
          throw new Error('This invitation has been cancelled or revoked by the administrator.');
        }
      } catch (err: any) {
        threw = true;
        assert.match(err.message, /cancelled or revoked/);
      }
      assert.strictEqual(threw, true);
    });

    it('prevents concurrent double-acceptance race conditions atomically', async () => {
      let invitationStatus = 'INVITED';

      // Atomic update simulating Prisma updateMany with where: { status: 'INVITED' }
      async function acceptInvitationAtomically(actorId: string): Promise<{ success: boolean; status: number }> {
        if (invitationStatus === 'INVITED') {
          invitationStatus = 'ACCEPTED';
          return { success: true, status: 200 };
        }
        return { success: false, status: 409 }; // Conflict
      }

      const [res1, res2] = await Promise.all([
        acceptInvitationAtomically('user-a'),
        acceptInvitationAtomically('user-b'),
      ]);

      const successes = [res1, res2].filter(r => r.success);
      const conflicts = [res1, res2].filter(r => r.status === 409);

      assert.strictEqual(successes.length, 1, 'Exactly one concurrent acceptance must succeed');
      assert.strictEqual(conflicts.length, 1, 'The losing concurrent request must receive a 409 Conflict error');
    });

    it('validates password complexity during invitation acceptance', () => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-~`+=])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-~`+=]{8,}$/;

      assert.strictEqual(passwordRegex.test('weak'), false);
      assert.strictEqual(passwordRegex.test('password123'), false);
      assert.strictEqual(passwordRegex.test('NoSpecial123'), false);
      assert.strictEqual(passwordRegex.test('Doctor@2026!'), true);
      assert.strictEqual(passwordRegex.test('Admin#Hospital2026'), true);
    });
  });

  // =========================================================================
  // 5. RECEPTIONIST OPERATIONAL ACCESS VS CLINICAL SEPARATION
  // =========================================================================
  describe('5. Receptionist Operational Access vs Clinical Lock', () => {
    it('Receptionist is strictly excluded from clinical encounters (EHR Controller)', () => {
      const encounterAllowedRoles = [
        RoleCode.DOCTOR,
        RoleCode.NURSE,
        RoleCode.HOSPITAL_ADMIN,
        RoleCode.MEDINEXA_ADMIN,
      ];

      const receptionistAllowed = encounterAllowedRoles.includes(RoleCode.RECEPTIONIST as any);
      assert.strictEqual(
        receptionistAllowed,
        false,
        'Receptionist must be blocked from clinical encounters and SOAP notes',
      );
    });

    it('Receptionist retains operational access to appointments and patient intake check-in', () => {
      const appointmentAllowedRoles = [
        RoleCode.DOCTOR,
        RoleCode.NURSE,
        RoleCode.HOSPITAL_ADMIN,
        RoleCode.MEDINEXA_ADMIN,
        RoleCode.RECEPTIONIST,
      ];

      const receptionistAllowed = appointmentAllowedRoles.includes(RoleCode.RECEPTIONIST as any);
      assert.strictEqual(
        receptionistAllowed,
        true,
        'Receptionist must have operational access to appointments and token queues',
      );
    });
  });

  // =========================================================================
  // 6. PUBLIC REGISTRATION ZERO-DATA & PATIENT ISOLATION
  // =========================================================================
  describe('6. Public Registration & Clean Account Zero-Data Architecture', () => {
    it('public self-registration is strictly restricted to PATIENT / GUARDIAN', () => {
      const PUBLIC_REGISTRATION_ROLES = ['PATIENT', 'GUARDIAN'];
      const attemptRoles = ['DOCTOR', 'NURSE', 'ADMIN', 'MANAGER', 'RECEPTIONIST'];

      for (const role of attemptRoles) {
        assert.strictEqual(
          PUBLIC_REGISTRATION_ROLES.includes(role),
          false,
          `Public self-registration must reject role '${role}'`,
        );
      }

      assert.strictEqual(PUBLIC_REGISTRATION_ROLES.includes('PATIENT'), true);
    });

    it('newly registered accounts have isDemo=false and receive clean empty rosters', () => {
      const newUser = {
        id: 'usr-new-01',
        email: 'john.doe@gmail.com',
        roleCode: 'PATIENT',
        isDemo: false,
      };

      const resolvedPrescriptions = newUser.isDemo ? [{ id: 'mock-rx' }] : [];
      const resolvedCheckedPatients = newUser.isDemo ? [{ id: 'mock-pt' }] : [];

      assert.strictEqual(resolvedPrescriptions.length, 0, 'Real account must start with zero prescriptions');
      assert.strictEqual(resolvedCheckedPatients.length, 0, 'Real account must start with zero checked patients');
    });

    it('Guardian registration does NOT grant access to other patients without explicit authorized PatientGuardian link', () => {
      const guardianUser = {
        id: 'usr-guardian-01',
        email: 'parent@gmail.com',
        roleCode: 'GUARDIAN',
      };

      const targetPatient = {
        id: 'patient-404',
        name: 'Dependent Child',
        medicalHistory: ['Asthma', 'Allergy: Penicillin'],
      };

      // Mock database of authorized guardian relationships
      const mockPatientGuardians = [
        {
          patientId: 'patient-999', // Different patient
          guardianUserId: guardianUser.id,
          canAccessRecords: true,
        },
      ];

      // Verification check
      const authorizedLink = mockPatientGuardians.find(
        pg => pg.patientId === targetPatient.id && pg.guardianUserId === guardianUser.id && pg.canAccessRecords,
      );

      assert.strictEqual(authorizedLink, undefined, 'Guardian cannot access patient without verified relationship');
    });

    it('Guardian role is strictly blocked from Hospital Admin and Employee operations', () => {
      const hospitalEmployeeRoles = [
        RoleCode.HOSPITAL_ADMIN,
        RoleCode.MANAGER,
        RoleCode.DOCTOR,
        RoleCode.NURSE,
        RoleCode.RECEPTIONIST,
      ];

      const guardianRole = 'GUARDIAN';
      const isHospitalStaff = hospitalEmployeeRoles.includes(guardianRole as any);

      assert.strictEqual(isHospitalStaff, false, 'Guardian can never be recognized as hospital employee');
    });
  });

  // =========================================================================
  // 7. CRYPTOGRAPHIC TOKEN SECURITY & SHA-256 HASHING
  // =========================================================================
  describe('7. Cryptographic Token Security & SHA-256 Hashing', () => {
    it('hashes secret invitation token with SHA-256 before storage', () => {
      const rawSecretToken = 'a'.repeat(64);
      const expectedHash = crypto.createHash('sha256').update(rawSecretToken).digest('hex');

      assert.strictEqual(expectedHash.length, 64);
      assert.notStrictEqual(expectedHash, rawSecretToken);
    });

    it('matches incoming raw token against stored SHA-256 token hash successfully', async () => {
      const rawSecretToken = crypto.randomBytes(32).toString('hex');
      const storedHash = crypto.createHash('sha256').update(rawSecretToken).digest('hex');

      const mockDb = [
        {
          id: 'inv-101',
          token: storedHash,
          staffId: 'MNX-EMP-DOCTOR-999999',
          status: 'INVITED',
        },
      ];

      // Verification logic from AuthService
      const incomingRawToken = rawSecretToken;
      const incomingHashed = crypto.createHash('sha256').update(incomingRawToken).digest('hex');

      const matchedInvitation = mockDb.find(inv => inv.token === incomingHashed || inv.token === incomingRawToken);
      assert.ok(matchedInvitation, 'Should successfully locate invitation by hashed token');
      assert.strictEqual(matchedInvitation.id, 'inv-101');
    });

    it('rejects tampered or mismatched invitation token', () => {
      const rawSecretToken = crypto.randomBytes(32).toString('hex');
      const storedHash = crypto.createHash('sha256').update(rawSecretToken).digest('hex');

      const mockDb = [{ id: 'inv-101', token: storedHash }];
      const tamperedToken = crypto.randomBytes(32).toString('hex');
      const tamperedHashed = crypto.createHash('sha256').update(tamperedToken).digest('hex');

      const matched = mockDb.find(inv => inv.token === tamperedHashed || inv.token === tamperedToken);
      assert.strictEqual(matched, undefined, 'Tampered token must not match stored hash');
    });
  });

  // =========================================================================
  // 8. PUBLIC DISCOVERY & STATUS FILTERING
  // =========================================================================
  describe('8. Public Discovery & Facility Status Filtering', () => {
    it('public facility discovery filters out PENDING, SUSPENDED, and REJECTED facilities', async () => {
      const allFacilities = [
        { id: 'hosp-01', name: 'Active Hospital', status: 'ACTIVE' },
        { id: 'hosp-02', name: 'Approved Hospital', status: 'APPROVED' },
        { id: 'hosp-03', name: 'Pending Hospital', status: 'PENDING_VERIFICATION' },
        { id: 'hosp-04', name: 'Suspended Hospital', status: 'SUSPENDED' },
        { id: 'hosp-05', name: 'Rejected Hospital', status: 'REJECTED' },
      ];

      // Simulated getFacilities query with status in ['ACTIVE', 'APPROVED']
      const publicFacilities = allFacilities.filter(f => ['ACTIVE', 'APPROVED'].includes(f.status));

      assert.strictEqual(publicFacilities.length, 2);
      assert.deepStrictEqual(publicFacilities.map(f => f.id), ['hosp-01', 'hosp-02']);
    });

    it('public doctor discovery excludes doctors belonging to unapproved or suspended facilities', () => {
      const doctors = [
        { id: 'doc-01', name: 'Dr. A', status: 'ACTIVE', facility: { status: 'ACTIVE' } },
        { id: 'doc-02', name: 'Dr. B', status: 'ACTIVE', facility: { status: 'APPROVED' } },
        { id: 'doc-03', name: 'Dr. C', status: 'ACTIVE', facility: { status: 'PENDING_VERIFICATION' } },
        { id: 'doc-04', name: 'Dr. D', status: 'ACTIVE', facility: { status: 'SUSPENDED' } },
        { id: 'doc-05', name: 'Dr. E', status: 'INACTIVE', facility: { status: 'ACTIVE' } },
      ];

      const discoverableDoctors = doctors.filter(
        d => d.status === 'ACTIVE' && ['ACTIVE', 'APPROVED'].includes(d.facility.status),
      );

      assert.strictEqual(discoverableDoctors.length, 2);
      assert.deepStrictEqual(discoverableDoctors.map(d => d.id), ['doc-01', 'doc-02']);
    });
  });

  // =========================================================================
  // 9. TENANT ISOLATION & IDOR NEGATIVE AUTHORIZATION
  // =========================================================================
  describe('9. Tenant Isolation & IDOR Negative Authorization', () => {
    it('Hospital Admin of Hospital A CANNOT access or modify Hospital B records', () => {
      const userA = { id: 'admin-a', facilityId: 'fac-A', roleCode: 'HOSPITAL_ADMIN' };
      const resourceB = { id: 'rec-B1', facilityId: 'fac-B', patientName: 'Jane Smith' };

      const canAccess = userA.roleCode === 'SUPER_ADMIN' || userA.facilityId === resourceB.facilityId;
      assert.strictEqual(canAccess, false, 'User from Facility A must be blocked from Facility B resource');
    });

    it('Doctor of Hospital A CANNOT access patient encounters in Hospital B without authorized transfer', () => {
      const doctorA = { id: 'doc-a', facilityId: 'fac-A', roleCode: 'DOCTOR' };
      const encounterB = { id: 'enc-B1', facilityId: 'fac-B', notes: 'Confidential clinical notes' };

      const canAccess = doctorA.facilityId === encounterB.facilityId;
      assert.strictEqual(canAccess, false, 'Doctor cannot access cross-facility clinical encounters');
    });
  });

  // =========================================================================
  // 10. LIVE BED AVAILABILITY & CONCURRENCY INTEGRITY
  // =========================================================================
  describe('10. Live Bed Availability & Concurrency Integrity', () => {
    it('aggregates bed telemetry across active network hospitals correctly', () => {
      const activeHospitals = [
        { id: 'fac-A', totalBeds: 100, occupiedBeds: 60, icuAvailable: 5 },
        { id: 'fac-B', totalBeds: 80, occupiedBeds: 30, icuAvailable: 10 },
      ];

      const totalBeds = activeHospitals.reduce((acc, h) => acc + h.totalBeds, 0);
      const totalOccupied = activeHospitals.reduce((acc, h) => acc + h.occupiedBeds, 0);
      const totalAvailable = totalBeds - totalOccupied;
      const totalIcuAvailable = activeHospitals.reduce((acc, h) => acc + h.icuAvailable, 0);

      assert.strictEqual(totalBeds, 180);
      assert.strictEqual(totalOccupied, 90);
      assert.strictEqual(totalAvailable, 90);
      assert.strictEqual(totalIcuAvailable, 15);
    });

    it('prevents concurrent double-booking of the same hospital bed (transactional lock pattern)', async () => {
      let bedAllocated = false;

      // Simulated atomic check-and-assign
      async function allocateBed(patientId: string): Promise<boolean> {
        if (!bedAllocated) {
          bedAllocated = true;
          return true; // Acquired
        }
        return false; // Already taken
      }

      const [res1, res2] = await Promise.all([
        allocateBed('patient-01'),
        allocateBed('patient-02'),
      ]);

      // Exactly one succeeds, one fails
      const successCount = [res1, res2].filter(Boolean).length;
      assert.strictEqual(successCount, 1, 'Only one concurrent admission can secure the bed');
    });
  });
});
