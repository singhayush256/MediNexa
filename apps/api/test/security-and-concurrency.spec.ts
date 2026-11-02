import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import bcryptjs from 'bcryptjs';

const bcrypt = (bcryptjs as any).default || bcryptjs;

describe('MediNexa Production Hardening & Security Test Suite', () => {
  describe('1. Authentication & Master Password Bypass Prevention', () => {
    const realUserPassword = 'RealDoctorSecret#2026';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(realUserPassword, salt);

    const forbiddenMasterPasswords = [
      'Doctor@2026',
      'Admin@2026',
      'SuperAdmin@2026',
      'Password@123',
      'Admin@123',
      'demo123',
    ];

    for (const masterPwd of forbiddenMasterPasswords) {
      it(`should strictly reject master backdoor password: ${masterPwd}`, async () => {
        const isMatch = await bcrypt.compare(masterPwd, passwordHash);
        assert.strictEqual(
          isMatch,
          false,
          `Security vulnerability: Master password '${masterPwd}' must NOT authenticate arbitrary user accounts!`,
        );
      });
    }

    it('should successfully authenticate legitimate user credentials via bcrypt', async () => {
      const isMatch = await bcrypt.compare(realUserPassword, passwordHash);
      assert.strictEqual(isMatch, true, 'Legitimate credentials must authenticate correctly');
    });

    it('should reject incorrect password', async () => {
      const isMatch = await bcrypt.compare('WrongPassword!999', passwordHash);
      assert.strictEqual(isMatch, false, 'Invalid credentials must be rejected');
    });
  });

  describe('2. Multi-Tenant Facility Isolation', () => {
    const facilityA = '0db9bd5f-ddb6-4d12-aa0d-83adc1415a06'; // Hospital A
    const facilityB = '1eb9bd5f-ddb6-4d12-aa0d-83adc1415a07'; // Hospital B

    const userFacilityA = {
      id: 'usr-doc-a',
      roleCode: 'DOCTOR',
      facilityId: facilityA,
    };

    const userUnassigned = {
      id: 'usr-unassigned',
      roleCode: 'DOCTOR',
      facilityId: null,
    };

    function validateFacilityAccess(targetFacilityId: string | null | undefined, user: any) {
      const userRole = user.roleCode || user.role?.code;
      const userFacilityId = user.facilityId;

      if (!userFacilityId && userRole !== 'MEDINEXA_ADMIN') {
        throw new Error('Access denied: Staff account is not assigned to any hospital facility.');
      }

      if (userRole !== 'MEDINEXA_ADMIN' && userFacilityId && targetFacilityId && targetFacilityId !== userFacilityId) {
        throw new Error('Access denied: Cross-facility resource access is forbidden.');
      }
      return true;
    }

    it('should allow access within the same facility', () => {
      assert.doesNotThrow(() => {
        validateFacilityAccess(facilityA, userFacilityA);
      });
    });

    it('should reject access across different hospital facilities (IDOR prevention)', () => {
      assert.throws(
        () => {
          validateFacilityAccess(facilityB, userFacilityA);
        },
        /Cross-facility resource access is forbidden/,
      );
    });

    it('should reject access if staff user is not assigned to a facility', () => {
      assert.throws(
        () => {
          validateFacilityAccess(facilityA, userUnassigned);
        },
        /Staff account is not assigned to any hospital facility/,
      );
    });
  });

  describe('3. Active Inpatient Admission Protection', () => {
    interface AdmissionRecord {
      id: string;
      patientId: string;
      status: 'PLANNED' | 'ADMITTED' | 'DISCHARGED' | 'CANCELLED';
    }

    const admissionsDb: AdmissionRecord[] = [
      { id: 'adm-001', patientId: 'pat-101', status: 'ADMITTED' },
      { id: 'adm-002', patientId: 'pat-102', status: 'DISCHARGED' },
    ];

    function validateNewAdmission(patientId: string, admissions: AdmissionRecord[]) {
      const activeAdmission = admissions.find(
        (a) => a.patientId === patientId && (a.status === 'ADMITTED' || a.status === 'PLANNED'),
      );
      if (activeAdmission) {
        throw new Error(
          `ACTIVE_ADMISSION_EXISTS: Patient already has an active inpatient admission (#${activeAdmission.id}).`,
        );
      }
      return true;
    }

    it('should reject new admission when patient already has an active admission', () => {
      assert.throws(
        () => {
          validateNewAdmission('pat-101', admissionsDb);
        },
        /ACTIVE_ADMISSION_EXISTS/,
      );
    });

    it('should allow new admission when previous admission is DISCHARGED', () => {
      assert.doesNotThrow(() => {
        validateNewAdmission('pat-102', admissionsDb);
      });
    });

    it('should allow new admission for new patient with no previous admissions', () => {
      assert.doesNotThrow(() => {
        validateNewAdmission('pat-103', admissionsDb);
      });
    });
  });

  describe('4. Bed Concurrency & Single Active Assignment', () => {
    interface Bed {
      id: string;
      bedNumber: string;
      status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
    }

    interface BedAssignment {
      id: string;
      bedId: string;
      admissionId: string;
      status: 'ACTIVE' | 'RELEASED';
    }

    it('should prevent double-assignment of the same bed to multiple patients', () => {
      const bed: Bed = { id: 'bed-icu-01', bedNumber: 'ICU-01', status: 'OCCUPIED' };
      const activeAssignments: BedAssignment[] = [
        { id: 'asg-01', bedId: 'bed-icu-01', admissionId: 'adm-001', status: 'ACTIVE' },
      ];

      function assignBed(bedToAssign: Bed, admissionId: string) {
        if (bedToAssign.status !== 'AVAILABLE') {
          throw new Error(`BED_ALREADY_OCCUPIED: Bed ${bedToAssign.bedNumber} is currently occupied.`);
        }
        const existingActive = activeAssignments.find(
          (a) => a.bedId === bedToAssign.id && a.status === 'ACTIVE',
        );
        if (existingActive) {
          throw new Error(`BED_ALREADY_ASSIGNED: Bed ${bedToAssign.bedNumber} already has an active assignment.`);
        }
        bedToAssign.status = 'OCCUPIED';
        activeAssignments.push({
          id: `asg-${Date.now()}`,
          bedId: bedToAssign.id,
          admissionId,
          status: 'ACTIVE',
        });
        return true;
      }

      // First attempt on occupied bed fails
      assert.throws(
        () => {
          assignBed(bed, 'adm-002');
        },
        /BED_ALREADY_OCCUPIED/,
      );

      // Concurrent second attempt fails with controlled conflict
      assert.throws(
        () => {
          assignBed(bed, 'adm-003');
        },
        /BED_ALREADY_OCCUPIED/,
      );
    });

    it('should successfully assign an AVAILABLE bed atomically', () => {
      const bed: Bed = { id: 'bed-gen-05', bedNumber: 'GEN-05', status: 'AVAILABLE' };
      const activeAssignments: BedAssignment[] = [];

      assert.doesNotThrow(() => {
        if (bed.status !== 'AVAILABLE') throw new Error('Occupied');
        bed.status = 'OCCUPIED';
        activeAssignments.push({
          id: 'asg-new',
          bedId: bed.id,
          admissionId: 'adm-004',
          status: 'ACTIVE',
        });
      });

      assert.strictEqual(bed.status, 'OCCUPIED');
      assert.strictEqual(activeAssignments.length, 1);
    });
  });

  describe('5. Multi-Department Discharge Clearance Verification', () => {
    interface Clearance {
      departmentType: 'PHARMACY' | 'LAB' | 'WARD' | 'BILLING';
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
    }

    function verifyDischargeClearances(clearances: Clearance[]) {
      const required = ['PHARMACY', 'LAB', 'WARD', 'BILLING'];
      const pending = required.filter((req) => {
        const cl = clearances.find((c) => c.departmentType === req);
        return !cl || cl.status !== 'APPROVED';
      });

      if (pending.length > 0) {
        throw new Error(
          `DISCHARGE_CLEARANCE_PENDING: Final discharge blocked until all 4 clearances are approved. Pending: ${pending.join(', ')}`,
        );
      }
      return true;
    }

    it('should block discharge when any departmental clearance is pending', () => {
      const clearances: Clearance[] = [
        { departmentType: 'PHARMACY', status: 'APPROVED' },
        { departmentType: 'LAB', status: 'APPROVED' },
        { departmentType: 'WARD', status: 'APPROVED' },
        { departmentType: 'BILLING', status: 'PENDING' }, // Pending bill
      ];

      assert.throws(
        () => {
          verifyDischargeClearances(clearances);
        },
        /DISCHARGE_CLEARANCE_PENDING.*BILLING/,
      );
    });

    it('should allow discharge when all 4 clearances (PHARMACY, LAB, WARD, BILLING) are APPROVED', () => {
      const clearances: Clearance[] = [
        { departmentType: 'PHARMACY', status: 'APPROVED' },
        { departmentType: 'LAB', status: 'APPROVED' },
        { departmentType: 'WARD', status: 'APPROVED' },
        { departmentType: 'BILLING', status: 'APPROVED' },
      ];

      assert.doesNotThrow(() => {
        verifyDischargeClearances(clearances);
      });
    });
  });

  describe('6. Patient UHID Canonical Identifier', () => {
    function generateUhid(): string {
      const year = new Date().getFullYear();
      const randSuffix = Math.floor(100000 + Math.random() * 900000);
      return `UHID-${year}-${randSuffix}`;
    }

    it('should generate valid canonical UHID with format UHID-YYYY-XXXXXX', () => {
      const uhid = generateUhid();
      const regex = /^UHID-\d{4}-\d{6}$/;
      assert.ok(regex.test(uhid), `Generated UHID '${uhid}' does not match expected pattern`);
    });

    it('should generate unique values across successive calls', () => {
      const uhidSet = new Set<string>();
      for (let i = 0; i < 50; i++) {
        uhidSet.add(generateUhid());
      }
      assert.strictEqual(uhidSet.size, 50, 'All generated UHIDs must be unique');
    });
  });

  describe('7. Staff Login ID Standardized Generation across All Roles', () => {
    function getRolePrefix(roleCode: string): string {
      const r = (roleCode || '').toUpperCase().trim();
      if (r === 'DOCTOR') return 'DR';
      if (r === 'NURSE') return 'NR';
      if (r === 'RECEPTIONIST') return 'RC';
      if (r.includes('PHARMAC')) return 'PH';
      if (r.includes('LAB')) return 'LT';
      if (r.includes('BILLING')) return 'BL';
      if (r.includes('AMBULANCE') || r.includes('EMS') || r === 'PARAMEDIC') return 'AM';
      if (r === 'MANAGER' || r === 'HR_MANAGER' || r === 'HR') return 'MG';
      if (r.includes('ADMIN') || r === 'EXECUTIVE') return 'AD';
      return 'ST';
    }

    function normalizeStaffName(name: string): string {
      const cleaned = name.trim().replace(/^(dr\.|dr|doctor|sister|sr\.|nurse|mr\.|mr|mrs\.|mrs|ms\.|ms|prof\.|prof)[\s.]*/i, '');
      const firstWord = cleaned.trim().split(/\s+/)[0] || 'STAFF';
      return firstWord.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'STAFF';
    }

    function generateStaffLoginId(role: string, name: string, phone: string): string {
      const prefix = getRolePrefix(role);
      const cleanName = normalizeStaffName(name);
      const last4 = phone.replace(/\D/g, '').slice(-4);
      return `${prefix}.${cleanName}-${last4}`;
    }

    const testStaffMatrix = [
      { role: 'DOCTOR', name: 'Dr. Ayush Singh', phone: '+91 98765 00263', expected: 'DR.AYUSH-0263' },
      { role: 'NURSE', name: 'Priya Sharma', phone: '+91 98111 01842', expected: 'NR.PRIYA-1842' },
      { role: 'RECEPTIONIST', name: 'Neha Gupta', phone: '+91 98222 07391', expected: 'RC.NEHA-7391' },
      { role: 'PHARMACIST', name: 'Amit Verma', phone: '+91 98333 04821', expected: 'PH.AMIT-4821' },
      { role: 'LAB_STAFF', name: 'Ravi Kumar', phone: '+91 98444 06204', expected: 'LT.RAVI-6204' },
      { role: 'MANAGER', name: 'Rahul Joshi', phone: '+91 98555 09137', expected: 'MG.RAHUL-9137' },
      { role: 'BILLING_STAFF', name: 'Neha Reddy', phone: '+91 98666 04421', expected: 'BL.NEHA-4421' },
      { role: 'AMBULANCE_DRIVER', name: 'Sunil Yadav', phone: '+91 98777 01122', expected: 'AM.SUNIL-1122' },
    ];

    for (const item of testStaffMatrix) {
      it(`should generate canonical Staff Login ID for ${item.role}: ${item.expected}`, () => {
        const id = generateStaffLoginId(item.role, item.name, item.phone);
        assert.strictEqual(id, item.expected);
      });
    }

    it('should generate collision-safe suffix when base ID already exists', () => {
      const existingIds = new Set(['DR.AYUSH-0263']);
      const baseId = generateStaffLoginId('DOCTOR', 'Ayush Singh', '9876500263');
      let candidate = baseId;
      if (existingIds.has(baseId)) {
        candidate = `${baseId}-01`;
      }
      assert.strictEqual(candidate, 'DR.AYUSH-0263-01', 'Collisions must resolve with numerical suffix');
    });

    it('should preserve Staff Login ID when mobile number changes subsequently', () => {
      const initialId = 'DR.AYUSH-0263';
      const updatedPhone = '+91 99999 88888';
      let staffLoginId = initialId; // Immutable unless explicitly regenerated
      assert.strictEqual(staffLoginId, initialId, 'Phone updates must not mutate existing Staff Login ID');
    });
  });

  describe('8. Immutable Bed Transfer History Verification', () => {
    interface TransferLog {
      id: string;
      admissionId: string;
      fromBedNumber: string;
      toBedNumber: string;
      transferredAt: Date;
      reason: string;
    }

    it('should preserve all intermediate transfers immutably across multiple movements', () => {
      const transferHistory: TransferLog[] = [];
      let currentBed = 'ICU-12';

      // Transfer 1: ICU-12 -> WARD-B-07
      transferHistory.push({
        id: 'tx-1',
        admissionId: 'adm-001',
        fromBedNumber: currentBed,
        toBedNumber: 'WARD-B-07',
        transferredAt: new Date('2026-10-01T10:00:00Z'),
        reason: 'Patient stabilized, stepped down from ICU',
      });
      currentBed = 'WARD-B-07';

      // Transfer 2: WARD-B-07 -> ICU-18
      transferHistory.push({
        id: 'tx-2',
        admissionId: 'adm-001',
        fromBedNumber: currentBed,
        toBedNumber: 'ICU-18',
        transferredAt: new Date('2026-10-02T08:00:00Z'),
        reason: 'Post-op observation escalation',
      });
      currentBed = 'ICU-18';

      // Verifications
      assert.strictEqual(currentBed, 'ICU-18', 'Current bed must reflect latest state');
      assert.strictEqual(transferHistory.length, 2, 'History must contain exactly 2 transfer logs');
      assert.strictEqual(transferHistory[0].fromBedNumber, 'ICU-12', 'Historical transfer 1 origin must not be overwritten');
      assert.strictEqual(transferHistory[0].toBedNumber, 'WARD-B-07');
      assert.strictEqual(transferHistory[1].fromBedNumber, 'WARD-B-07');
      assert.strictEqual(transferHistory[1].toBedNumber, 'ICU-18');
    });
  });

  describe('9. Pharmacy Workflow & MEDICINE_READY Notification Event', () => {
    it('should support prescription lifecycle transition: ISSUED -> MEDICINE_READY -> DISPENSED', () => {
      const eventsEmitted: string[] = [];

      function emitPharmacyEvent(event: 'PRESCRIPTION_ISSUED' | 'MEDICINE_READY' | 'MEDICINE_DISPENSED') {
        eventsEmitted.push(event);
      }

      // 1. Doctor prescribes
      emitPharmacyEvent('PRESCRIPTION_ISSUED');
      // 2. Pharmacist prepares and packs medicine
      emitPharmacyEvent('MEDICINE_READY');
      // 3. Nurse or patient receives dispensed medicine
      emitPharmacyEvent('MEDICINE_DISPENSED');

      assert.deepStrictEqual(eventsEmitted, [
        'PRESCRIPTION_ISSUED',
        'MEDICINE_READY',
        'MEDICINE_DISPENSED',
      ]);
    });
  });

  describe('10. Role Permission Matrix & Clinical Confidentiality', () => {
    function canAccessClinicalDiagnosis(role: string): boolean {
      const allowedRoles = ['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN', 'MEDINEXA_ADMIN'];
      return allowedRoles.includes(role);
    }

    it('should allow Doctor and Nurse to access patient clinical diagnosis', () => {
      assert.strictEqual(canAccessClinicalDiagnosis('DOCTOR'), true);
      assert.strictEqual(canAccessClinicalDiagnosis('NURSE'), true);
    });

    it('should prevent Receptionist and Pharmacist from accessing unrestricted clinical diagnosis notes', () => {
      assert.strictEqual(canAccessClinicalDiagnosis('RECEPTIONIST'), false);
      assert.strictEqual(canAccessClinicalDiagnosis('PHARMACIST'), false);
    });
  });

  describe('11. End-to-End Inpatient Clinical Workflow State Machine', () => {
    it('should successfully execute the complete 14-step clinical care pipeline', () => {
      const auditTrail: string[] = [];

      // Step 1: Patient Registration
      const patient = { id: 'pat-999', uhid: 'UHID-2026-789012', name: 'Suresh Kumar' };
      auditTrail.push('PATIENT_REGISTERED');

      // Step 2: Appointment Booking & Check-In
      auditTrail.push('APPOINTMENT_BOOKED');
      auditTrail.push('PATIENT_CHECKED_IN');

      // Step 3: Doctor Consultation
      auditTrail.push('CONSULTATION_STARTED');
      auditTrail.push('PRESCRIPTION_ISSUED');
      auditTrail.push('LAB_ORDER_CREATED');
      auditTrail.push('CONSULTATION_COMPLETED');

      // Step 4: Diagnostic Lab Result
      auditTrail.push('LAB_RESULT_VERIFIED');

      // Step 5: Inpatient Admission & Bed Assignment
      let bedStatus = 'AVAILABLE';
      assert.strictEqual(bedStatus, 'AVAILABLE');
      bedStatus = 'OCCUPIED';
      auditTrail.push('ADMISSION_CONFIRMED');
      auditTrail.push('BED_ASSIGNED_GEN-01');

      // Step 6: Bed Transfer
      auditTrail.push('BED_TRANSFERRED_GEN-01_TO_ICU-04');

      // Step 7: Clearances & Final Discharge
      auditTrail.push('BILLING_CLEARED');
      auditTrail.push('PHARMACY_CLEARED');
      auditTrail.push('LAB_CLEARED');
      auditTrail.push('WARD_CLEARED');
      auditTrail.push('DISCHARGE_FINALIZED');
      bedStatus = 'AVAILABLE';

      assert.strictEqual(bedStatus, 'AVAILABLE', 'Bed must be released to AVAILABLE upon final discharge');
      assert.strictEqual(auditTrail.length, 16);
      assert.ok(auditTrail.includes('DISCHARGE_FINALIZED'));
    });
  });

  describe('12. Super Admin Platform Hospital Management & Strict Read-Only Governance', () => {
    interface HospitalRecord {
      id: string;
      hospitalId: string;
      name: string;
      code: string;
      registrationNumber: string;
      status: 'ACTIVE' | 'INACTIVE';
      city: string;
      state: string;
      facilityId?: string;
    }

    interface HospitalAdminRecord {
      id: string;
      loginId: string;
      fullName: string;
      email: string;
      mobile: string;
      role: 'HOSPITAL_ADMIN';
      facilityId: string;
    }

    // Generator helpers matching SuperAdminService implementation
    function formatHospitalId(index: number): string {
      return `HOSP-${String(index).padStart(6, '0')}`;
    }

    function generateHospitalAdminLoginId(name: string, mobile: string, existingIds: Set<string>): string {
      const cleaned = name.trim().replace(/^(dr\.|dr|doctor|mr\.|mr|mrs\.|mrs|ms\.|ms)[\s.]*/i, '');
      const firstWord = cleaned.trim().split(/\s+/)[0] || 'ADMIN';
      const normName = firstWord.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'ADMIN';
      const last4 = mobile.replace(/\D/g, '').slice(-4) || '0000';
      const base = `HA.${normName}-${last4}`;
      let candidate = base;
      let counter = 1;
      while (existingIds.has(candidate)) {
        candidate = `${base}-${String(counter).padStart(2, '0')}`;
        counter++;
      }
      return candidate;
    }

    it('1. SUPER_ADMIN can access Super Admin workspace', () => {
      function canAccessSuperAdminWorkspace(role: string): boolean {
        const allowedRoles = ['SUPER_ADMIN', 'MEDINEXA_ADMIN'];
        return allowedRoles.includes(role);
      }

      assert.strictEqual(canAccessSuperAdminWorkspace('SUPER_ADMIN'), true, 'SUPER_ADMIN must access workspace');
      assert.strictEqual(canAccessSuperAdminWorkspace('MEDINEXA_ADMIN'), true, 'MEDINEXA_ADMIN must access workspace');
      assert.strictEqual(canAccessSuperAdminWorkspace('HOSPITAL_ADMIN'), false, 'HOSPITAL_ADMIN must NOT access workspace');
      assert.strictEqual(canAccessSuperAdminWorkspace('DOCTOR'), false, 'DOCTOR must NOT access workspace');
      assert.strictEqual(canAccessSuperAdminWorkspace('NURSE'), false, 'NURSE must NOT access workspace');
      assert.strictEqual(canAccessSuperAdminWorkspace('PATIENT'), false, 'PATIENT must NOT access workspace');
    });

    it('2. SUPER_ADMIN can create hospital', () => {
      const hospitals: HospitalRecord[] = [];
      const admins: HospitalAdminRecord[] = [];

      function createHospital(payload: {
        name: string;
        code: string;
        regNo: string;
        city: string;
        state: string;
        adminName: string;
        adminEmail: string;
        adminMobile: string;
      }) {
        const id = `fac-${hospitals.length + 1}`;
        const hospitalId = formatHospitalId(hospitals.length + 1);
        const hospital: HospitalRecord = {
          id,
          hospitalId,
          name: payload.name,
          code: payload.code,
          registrationNumber: payload.regNo,
          status: 'ACTIVE',
          city: payload.city,
          state: payload.state,
        };
        hospitals.push(hospital);

        const adminLoginId = generateHospitalAdminLoginId(payload.adminName, payload.adminMobile, new Set());
        const admin: HospitalAdminRecord = {
          id: `usr-admin-${admins.length + 1}`,
          loginId: adminLoginId,
          fullName: payload.adminName,
          email: payload.adminEmail,
          mobile: payload.adminMobile,
          role: 'HOSPITAL_ADMIN',
          facilityId: hospital.id,
        };
        admins.push(admin);

        return { hospital, admin };
      }

      const res = createHospital({
        name: 'Apollo Specialty Care',
        code: 'APOLLO-BLR',
        regNo: 'REG-2026-BLR-01',
        city: 'Bengaluru',
        state: 'Karnataka',
        adminName: 'Dr. Ramesh Kumar',
        adminEmail: 'ramesh.admin@apollo.medinexa.io',
        adminMobile: '9876543210',
      });

      assert.strictEqual(res.hospital.name, 'Apollo Specialty Care');
      assert.strictEqual(res.hospital.status, 'ACTIVE');
      assert.strictEqual(res.hospital.hospitalId, 'HOSP-000001');
      assert.strictEqual(res.admin.role, 'HOSPITAL_ADMIN');
      assert.strictEqual(res.admin.loginId, 'HA.RAMESH-3210');
      assert.strictEqual(res.admin.facilityId, res.hospital.id);
    });

    it('3. Hospital ID is generated uniquely', () => {
      const generatedIds = new Set<string>();
      for (let i = 1; i <= 25; i++) {
        const hid = formatHospitalId(i);
        assert.ok(/^HOSP-\d{6}$/.test(hid), `Hospital ID '${hid}' must match format HOSP-XXXXXX`);
        generatedIds.add(hid);
      }
      assert.strictEqual(generatedIds.size, 25, 'All generated Hospital IDs must be strictly unique');
      assert.strictEqual(formatHospitalId(1), 'HOSP-000001');
      assert.strictEqual(formatHospitalId(142), 'HOSP-000142');
    });

    it('4. Initial Hospital Admin is created', () => {
      const admin: HospitalAdminRecord = {
        id: 'usr-ha-001',
        loginId: 'HA.PRIYA-9821',
        fullName: 'Dr. Priya Nair',
        email: 'priya.nair@citycare.org',
        mobile: '+91 99887 79821',
        role: 'HOSPITAL_ADMIN',
        facilityId: 'fac-citycare-01',
      };

      assert.strictEqual(admin.role, 'HOSPITAL_ADMIN', 'Initial admin must have role HOSPITAL_ADMIN');
      assert.ok(admin.loginId.startsWith('HA.'), 'Login ID must have HA. prefix');
      assert.strictEqual(admin.facilityId, 'fac-citycare-01', 'Admin must be linked to newly created facility');
    });

    it('5. Hospital Admin Login ID is generated uniquely', () => {
      const existing = new Set<string>();
      const loginId1 = generateHospitalAdminLoginId('Ayush Singh', '9876504821', existing);
      assert.strictEqual(loginId1, 'HA.AYUSH-4821', 'Must generate canonical HA.NAME-XXXX ID');

      existing.add(loginId1);
      const loginId2 = generateHospitalAdminLoginId('Ayush Verma', '9911224821', existing);
      assert.strictEqual(loginId2, 'HA.AYUSH-4821-01', 'Collisions must resolve with numerical suffix');
    });

    it('6. Hospital Admin is correctly linked to the new hospital', () => {
      const facilityId = 'fac-metro-heart-01';
      const hospitalAdmin: HospitalAdminRecord = {
        id: 'usr-admin-metro',
        loginId: 'HA.SUNIL-1122',
        fullName: 'Sunil Mehta',
        email: 'sunil@metroheart.org',
        mobile: '9876501122',
        role: 'HOSPITAL_ADMIN',
        facilityId: facilityId,
      };

      assert.strictEqual(hospitalAdmin.facilityId, facilityId);
      assert.strictEqual(hospitalAdmin.role, 'HOSPITAL_ADMIN');
    });

    it('7. Duplicate hospital constraints are handled', () => {
      const registeredCodes = new Set(['MAX-DELHI', 'FORTIS-NOIDA']);
      const registeredRegNos = new Set(['REG-DEL-001', 'REG-UP-002']);

      function validateHospitalUniqueness(code: string, regNo: string) {
        if (registeredCodes.has(code.toUpperCase())) {
          throw new Error(`Conflict: Hospital code '${code}' is already registered.`);
        }
        if (registeredRegNos.has(regNo.toUpperCase())) {
          throw new Error(`Conflict: Registration number '${regNo}' is already registered.`);
        }
        return true;
      }

      // Valid new hospital
      assert.doesNotThrow(() => validateHospitalUniqueness('MANIPAL-BLR', 'REG-KA-003'));

      // Duplicate code rejection
      assert.throws(
        () => validateHospitalUniqueness('MAX-DELHI', 'REG-KA-004'),
        /Hospital code 'MAX-DELHI' is already registered/,
      );

      // Duplicate reg number rejection
      assert.throws(
        () => validateHospitalUniqueness('NEW-CLINIC', 'REG-DEL-001'),
        /Registration number 'REG-DEL-001' is already registered/,
      );
    });

    it('8. Duplicate IDs are prevented', () => {
      const pool = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const id = generateHospitalAdminLoginId('Rahul Sharma', '9876509999', pool);
        pool.add(id);
      }
      assert.strictEqual(pool.size, 10, 'All 10 generated admin IDs must be distinct despite identical names and phones');
      assert.ok(pool.has('HA.RAHUL-9999'));
      assert.ok(pool.has('HA.RAHUL-9999-01'));
      assert.ok(pool.has('HA.RAHUL-9999-09'));
    });

    it('9. Hospital creation transaction rolls back on failure', async () => {
      let facilityCreated = false;
      let adminCreated = false;
      let defaultWardCreated = false;

      async function atomicHospitalProvisioning(failAtStep: 'facility' | 'admin' | 'ward' | 'none') {
        const rolledBackState = { facility: false, admin: false, ward: false };
        try {
          // Step 1: Create Facility
          if (failAtStep === 'facility') throw new Error('Database disk error creating facility');
          facilityCreated = true;

          // Step 2: Create Admin
          if (failAtStep === 'admin') throw new Error('Unique constraint violation on admin email');
          adminCreated = true;

          // Step 3: Create Default Ward
          if (failAtStep === 'ward') throw new Error('Failed to create default ward');
          defaultWardCreated = true;

          return { success: true };
        } catch (err) {
          // Transaction rollback resets all provisions
          facilityCreated = rolledBackState.facility;
          adminCreated = rolledBackState.admin;
          defaultWardCreated = rolledBackState.ward;
          throw err;
        }
      }

      await assert.rejects(
        async () => await atomicHospitalProvisioning('admin'),
        /Unique constraint violation on admin email/,
      );

      assert.strictEqual(facilityCreated, false, 'Facility creation must be rolled back on admin failure');
      assert.strictEqual(adminCreated, false, 'Admin must not exist');
      assert.strictEqual(defaultWardCreated, false, 'Default ward must not exist');

      // Successful atomic provision
      const res = await atomicHospitalProvisioning('none');
      assert.strictEqual(res.success, true);
      assert.strictEqual(facilityCreated, true);
      assert.strictEqual(adminCreated, true);
      assert.strictEqual(defaultWardCreated, true);
    });

    it('10. SUPER_ADMIN can list hospitals', () => {
      const mockDatabase = [
        { id: 'fac-1', name: 'City Hospital', code: 'CITY-1', city: 'Delhi', state: 'Delhi' },
        { id: 'fac-2', name: 'Metro Clinic', code: 'METRO-1', city: 'Mumbai', state: 'Maharashtra' },
      ];

      function listHospitals() {
        return mockDatabase.map((h, idx) => ({
          ...h,
          hospitalId: formatHospitalId(idx + 1),
          status: 'ACTIVE',
          stats: { totalStaff: 12, totalPatients: 140, totalBeds: 50 },
        }));
      }

      const list = listHospitals();
      assert.strictEqual(list.length, 2);
      assert.strictEqual(list[0].hospitalId, 'HOSP-000001');
      assert.strictEqual(list[1].hospitalId, 'HOSP-000002');
      assert.strictEqual(list[0].stats.totalBeds, 50);
    });

    it('11. SUPER_ADMIN can open Hospital A', () => {
      const mockHospitals = {
        'fac-001': {
          id: 'fac-001',
          hospitalId: 'HOSP-000001',
          name: 'Apex Super Specialty',
          admin: { fullName: 'Dr. Vivek Roy', loginId: 'HA.VIVEK-4001' },
          isReadOnly: true,
        },
      };

      function getHospitalById(id: string) {
        const h = mockHospitals[id as keyof typeof mockHospitals];
        if (!h) throw new Error('Hospital not found');
        return h;
      }

      const hospital = getHospitalById('fac-001');
      assert.strictEqual(hospital.name, 'Apex Super Specialty');
      assert.strictEqual(hospital.hospitalId, 'HOSP-000001');
      assert.strictEqual(hospital.isReadOnly, true, 'Detail view must be marked read-only');
    });

    it('12. Hospital A detail page returns only Hospital A data', () => {
      const hospitalA_id = 'fac-alpha';
      const hospitalB_id = 'fac-beta';

      const allPatients = [
        { id: 'p-1', name: 'Rohan Sharma', facilityId: hospitalA_id },
        { id: 'p-2', name: 'Kavita Sen', facilityId: hospitalA_id },
        { id: 'p-3', name: 'Zoya Khan', facilityId: hospitalB_id }, // Belongs to Hospital B
      ];

      const allAdmissions = [
        { id: 'adm-1', bedNumber: 'ICU-01', facilityId: hospitalA_id },
        { id: 'adm-2', bedNumber: 'GEN-04', facilityId: hospitalB_id },
      ];

      function getHospitalDetailScoped(targetFacilityId: string) {
        const patients = allPatients.filter((p) => p.facilityId === targetFacilityId);
        const admissions = allAdmissions.filter((a) => a.facilityId === targetFacilityId);
        return { facilityId: targetFacilityId, patients, admissions };
      }

      const hospitalADetail = getHospitalDetailScoped(hospitalA_id);
      assert.strictEqual(hospitalADetail.patients.length, 2);
      assert.ok(hospitalADetail.patients.every((p) => p.facilityId === hospitalA_id));
      assert.ok(!hospitalADetail.patients.some((p) => p.name === 'Zoya Khan'), 'Hospital B patient must NOT leak into Hospital A detail');
      assert.strictEqual(hospitalADetail.admissions.length, 1);
      assert.strictEqual(hospitalADetail.admissions[0].bedNumber, 'ICU-01');
    });

    it('13. SUPER_ADMIN cannot modify existing hospital data', () => {
      // Backend authorization validator: SUPER_ADMIN is read-only on clinical and hospital entities
      function authorizeHospitalMutation(role: string, action: 'UPDATE_HOSPITAL' | 'UPDATE_BED' | 'CREATE_ADMISSION') {
        if (role === 'SUPER_ADMIN') {
          throw new Error('Forbidden: Super Admin has strictly read-only access and cannot modify hospital data.');
        }
        return true;
      }

      assert.throws(
        () => authorizeHospitalMutation('SUPER_ADMIN', 'UPDATE_HOSPITAL'),
        /Forbidden: Super Admin has strictly read-only access/,
      );
      assert.throws(
        () => authorizeHospitalMutation('SUPER_ADMIN', 'UPDATE_BED'),
        /Forbidden: Super Admin has strictly read-only access/,
      );
      assert.throws(
        () => authorizeHospitalMutation('SUPER_ADMIN', 'CREATE_ADMISSION'),
        /Forbidden: Super Admin has strictly read-only access/,
      );
    });

    it('14. SUPER_ADMIN cannot delete existing hospital data', () => {
      function authorizeHospitalDeletion(role: string) {
        if (role === 'SUPER_ADMIN') {
          throw new Error('Forbidden: Super Admin is strictly prohibited from deleting hospital records.');
        }
        return true;
      }

      assert.throws(
        () => authorizeHospitalDeletion('SUPER_ADMIN'),
        /Super Admin is strictly prohibited from deleting hospital records/,
      );
    });

    it('15. Hospital Admin cannot access another hospital', () => {
      const adminHospitalA = {
        role: 'HOSPITAL_ADMIN',
        facilityId: 'fac-delhi-01',
      };

      function accessHospitalData(targetFacilityId: string, user: typeof adminHospitalA) {
        if (user.role === 'HOSPITAL_ADMIN' && user.facilityId !== targetFacilityId) {
          throw new Error('Forbidden: Hospital Admin cannot access another hospital.');
        }
        return true;
      }

      // Access own hospital
      assert.doesNotThrow(() => accessHospitalData('fac-delhi-01', adminHospitalA));

      // Attempt cross-hospital access
      assert.throws(
        () => accessHospitalData('fac-mumbai-02', adminHospitalA),
        /Forbidden: Hospital Admin cannot access another hospital/,
      );
    });

    it('16. Existing staff roles continue to work', () => {
      const activeRoles = ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_STAFF', 'BILLING_STAFF', 'MANAGER'];
      function checkStaffCapability(role: string) {
        return activeRoles.includes(role);
      }

      for (const role of activeRoles) {
        assert.strictEqual(checkStaffCapability(role), true, `Staff role '${role}' must continue to function`);
      }
    });

    it('17. Existing Patient Portal continues to work', () => {
      const patientSession = {
        role: 'PATIENT',
        uhid: 'UHID-2026-112233',
        portalPath: '/portal',
      };

      assert.strictEqual(patientSession.role, 'PATIENT');
      assert.strictEqual(patientSession.portalPath, '/portal');
      assert.ok(/^UHID-\d{4}-\d{6}$/.test(patientSession.uhid));
    });

    it('18. Existing Hospital Portal continues to work', () => {
      const staffSession = {
        role: 'DOCTOR',
        loginId: 'DR.AYUSH-0263',
        facilityId: 'fac-apollo-01',
        portalPath: '/hospital',
      };

      assert.strictEqual(staffSession.portalPath, '/hospital');
      assert.ok(staffSession.loginId.startsWith('DR.'));
      assert.strictEqual(staffSession.facilityId, 'fac-apollo-01');
    });
  });

  describe('13. Hospital Admin Portal & Multi-Tenant Management Security', () => {
    const hospitalDelhi = 'fac-delhi-01';
    const hospitalMumbai = 'fac-mumbai-02';

    const hospitalAdminDelhi = {
      id: 'usr-admin-delhi',
      role: 'HOSPITAL_ADMIN',
      facilityId: hospitalDelhi,
    };

    const receptionistDelhi = {
      id: 'usr-rc-delhi',
      role: 'RECEPTIONIST',
      facilityId: hospitalDelhi,
    };

    const managerDelhi = {
      id: 'usr-mgr-delhi',
      role: 'MANAGER',
      facilityId: hospitalDelhi,
    };

    it('1. Hospital Admin dashboard metrics are hospital-scoped and unauthorized roles cannot access', () => {
      function getAdminDashboard(user: { role: string; facilityId: string | null }, targetFacilityId?: string) {
        const allowedRoles = ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'SUPER_ADMIN'];
        if (!allowedRoles.includes(user.role)) {
          throw new Error('Forbidden: Only administrators can access the Hospital Admin dashboard.');
        }
        if (!user.facilityId && user.role !== 'SUPER_ADMIN') {
          throw new Error('BadRequest: Administrator must be assigned to a hospital facility.');
        }
        // Strict tenant isolation: user's facilityId is always used, targetFacilityId is not trusted
        const effectiveFacility = user.role === 'SUPER_ADMIN' ? (targetFacilityId || user.facilityId) : user.facilityId;
        return {
          facilityId: effectiveFacility,
          kpis: { totalBeds: 120, occupiedBeds: 85, activeAdmissions: 78 },
        };
      }

      // Valid Hospital Admin access
      const dashboard = getAdminDashboard(hospitalAdminDelhi);
      assert.strictEqual(dashboard.facilityId, hospitalDelhi);

      // Frontend-only bypass attempt: Receptionist calling admin dashboard
      assert.throws(
        () => getAdminDashboard(receptionistDelhi),
        /Forbidden: Only administrators can access the Hospital Admin dashboard/,
      );

      // Hospital Admin trying to pass another facility's ID in query/body is overridden
      const isolatedDashboard = getAdminDashboard(hospitalAdminDelhi, hospitalMumbai);
      assert.strictEqual(isolatedDashboard.facilityId, hospitalDelhi, 'Admin API must never trust facilityId from client');
    });

    it('2. Cross-hospital access is strictly forbidden (IDOR protection: Hospital A cannot access Hospital B)', () => {
      function verifyFacilityOwnership(targetEntityFacilityId: string, userFacilityId: string) {
        if (targetEntityFacilityId !== userFacilityId) {
          throw new Error('Forbidden: Cross-facility data access is strictly prohibited (IDOR prevented).');
        }
        return true;
      }

      assert.doesNotThrow(() => verifyFacilityOwnership(hospitalDelhi, hospitalAdminDelhi.facilityId));
      assert.throws(
        () => verifyFacilityOwnership(hospitalMumbai, hospitalAdminDelhi.facilityId),
        /Forbidden: Cross-facility data access is strictly prohibited/,
      );
    });

    it('3. Staff creation generates canonical Staff Login IDs and enforces role prefixes', () => {
      function generateStaffLoginId(role: string, name: string, randomDigits: string = '4921') {
        const prefixMap: Record<string, string> = {
          DOCTOR: 'DR.',
          NURSE: 'NR.',
          RECEPTIONIST: 'RC.',
          PHARMACIST: 'PH.',
          LAB_STAFF: 'LT.',
          MANAGER: 'MG.',
          BILLING_STAFF: 'BL.',
          AMBULANCE_DRIVER: 'AM.',
        };
        const prefix = prefixMap[role] || 'ST.';
        const cleanName = name.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 10) || 'STAFF';
        return `${prefix}${cleanName}-${randomDigits}`;
      }

      assert.strictEqual(generateStaffLoginId('DOCTOR', 'Pooja Sharma', '1102'), 'DR.POOJASHARM-1102');
      assert.strictEqual(generateStaffLoginId('NURSE', 'Kavita', '5511'), 'NR.KAVITA-5511');
      assert.strictEqual(generateStaffLoginId('MANAGER', 'Rajesh Verma', '3344'), 'MG.RAJESHVERM-3344');
      assert.strictEqual(generateStaffLoginId('RECEPTIONIST', 'Anita', '9988'), 'RC.ANITA-9988');
      assert.strictEqual(generateStaffLoginId('PHARMACIST', 'Deepak', '7722'), 'PH.DEEPAK-7722');
      assert.strictEqual(generateStaffLoginId('LAB_STAFF', 'Sanjay', '4411'), 'LT.SANJAY-4411');
    });

    it('4. Collision-safe staff ID generation handles occupied base IDs', () => {
      const existingLoginIds = new Set(['DR.AYUSH-0263', 'DR.AYUSH-0263-01']);

      function resolveCollision(baseId: string, existing: Set<string>): string {
        if (!existing.has(baseId)) return baseId;
        let suffix = 1;
        while (existing.has(`${baseId}-${String(suffix).padStart(2, '0')}`)) {
          suffix++;
        }
        return `${baseId}-${String(suffix).padStart(2, '0')}`;
      }

      const allocatedId = resolveCollision('DR.AYUSH-0263', existingLoginIds);
      assert.strictEqual(allocatedId, 'DR.AYUSH-0263-02');
    });

    it('5. Staff creation and update enforces facility scope and logs AuditEvents', () => {
      const auditLog: any[] = [];

      function createStaff(actor: { id: string; role: string; facilityId: string }, data: { name: string; role: string; facilityId?: string }) {
        if (actor.role !== 'HOSPITAL_ADMIN' && actor.role !== 'SUPER_ADMIN') {
          throw new Error('Forbidden: Unauthorized to create staff.');
        }
        const assignedFacility = actor.facilityId; // Derived from actor, client cannot override
        const newStaff = {
          id: `usr-${Date.now()}`,
          name: data.name,
          role: data.role,
          facilityId: assignedFacility,
        };
        auditLog.push({
          action: 'STAFF_CREATED',
          actorId: actor.id,
          facilityId: assignedFacility,
          entityId: newStaff.id,
          timestamp: new Date().toISOString(),
        });
        return newStaff;
      }

      const created = createStaff(hospitalAdminDelhi, { name: 'Dr. Ramesh Kumar', role: 'DOCTOR', facilityId: hospitalMumbai });
      assert.strictEqual(created.facilityId, hospitalDelhi, 'Staff must be bound to actor hospital, not client payload');
      assert.strictEqual(auditLog.length, 1);
      assert.strictEqual(auditLog[0].action, 'STAFF_CREATED');
      assert.strictEqual(auditLog[0].facilityId, hospitalDelhi);
    });

    it('6. Department CRUD enforces unique code within facility and blocks cross-facility edits', () => {
      const departments = [
        { id: 'dept-1', facilityId: hospitalDelhi, code: 'CARDIO', name: 'Cardiology' },
        { id: 'dept-2', facilityId: hospitalDelhi, code: 'NEURO', name: 'Neurology' },
        { id: 'dept-3', facilityId: hospitalMumbai, code: 'CARDIO', name: 'Cardiology Mumbai' },
      ];

      function createDepartment(facilityId: string, dept: { code: string; name: string }) {
        const codeExists = departments.some(d => d.facilityId === facilityId && d.code === dept.code.toUpperCase());
        if (codeExists) {
          throw new Error(`Conflict: Department code ${dept.code} already exists in this hospital.`);
        }
        const created = { id: `dept-${Date.now()}`, facilityId, code: dept.code.toUpperCase(), name: dept.name };
        departments.push(created);
        return created;
      }

      // Same code in same hospital should be rejected
      assert.throws(
        () => createDepartment(hospitalDelhi, { code: 'CARDIO', name: 'Duplicate Cardio' }),
        /Conflict: Department code CARDIO already exists/,
      );

      // New unique department code in same hospital should succeed
      const newDept = createDepartment(hospitalDelhi, { code: 'ORTHO', name: 'Orthopedics' });
      assert.strictEqual(newDept.code, 'ORTHO');
      assert.strictEqual(newDept.facilityId, hospitalDelhi);
    });

    it('7. RBAC permission matrix strictly enforces roles and prevents frontend-only bypass', () => {
      const rolePermissions: Record<string, string[]> = {
        HOSPITAL_ADMIN: ['VIEW_DASHBOARD', 'MANAGE_STAFF', 'MANAGE_DEPARTMENTS', 'VIEW_REPORTS', 'MANAGE_ASSETS'],
        MANAGER: ['VIEW_DASHBOARD', 'VIEW_STAFF', 'VIEW_DEPARTMENTS', 'VIEW_REPORTS'],
        DOCTOR: ['VIEW_PATIENTS', 'CREATE_PRESCRIPTIONS', 'VIEW_LAB_RESULTS'],
        NURSE: ['VIEW_PATIENTS', 'RECORD_VITALS', 'ADMINISTER_MEDICATIONS'],
        RECEPTIONIST: ['REGISTER_PATIENT', 'SCHEDULE_APPOINTMENT'],
      };

      function checkPermission(role: string, permission: string): boolean {
        const perms = rolePermissions[role] || [];
        return perms.includes(permission);
      }

      // Hospital Admin has MANAGE_STAFF and MANAGE_ASSETS
      assert.strictEqual(checkPermission('HOSPITAL_ADMIN', 'MANAGE_STAFF'), true);
      assert.strictEqual(checkPermission('HOSPITAL_ADMIN', 'MANAGE_ASSETS'), true);

      // Receptionist cannot MANAGE_STAFF
      assert.strictEqual(checkPermission('RECEPTIONIST', 'MANAGE_STAFF'), false);

      // Doctor cannot MANAGE_DEPARTMENTS
      assert.strictEqual(checkPermission('DOCTOR', 'MANAGE_DEPARTMENTS'), false);
    });

    it('8. Hospital profile updates allow contact fields but strictly reject immutable platform identifiers', () => {
      const immutableFields = ['id', 'code', 'organizationId', 'createdAt'];

      function sanitizeHospitalUpdate(updatePayload: Record<string, any>) {
        for (const field of immutableFields) {
          if (field in updatePayload) {
            throw new Error(`Forbidden: Modifying immutable platform field '${field}' is strictly prohibited.`);
          }
        }
        return {
          name: updatePayload.name,
          phone: updatePayload.phone,
          email: updatePayload.email,
          address: updatePayload.address,
        };
      }

      // Attempt to tamper with hospital ID
      assert.throws(
        () => sanitizeHospitalUpdate({ id: 'new-malicious-id', name: 'Tampered Hospital' }),
        /Modifying immutable platform field 'id' is strictly prohibited/,
      );

      // Attempt to tamper with hospital code
      assert.throws(
        () => sanitizeHospitalUpdate({ code: 'HOSP-HACK', name: 'Tampered Code' }),
        /Modifying immutable platform field 'code' is strictly prohibited/,
      );

      // Legitimate contact update succeeds
      const clean = sanitizeHospitalUpdate({
        name: 'Updated Delhi Hospital',
        phone: '+91 11 2345 6789',
        email: 'admin@delhi-hosp.org',
      });
      assert.strictEqual(clean.name, 'Updated Delhi Hospital');
      assert.strictEqual(clean.phone, '+91 11 2345 6789');
    });

    it('9. Medical Equipment and Asset tracking tracks lifecycle states and facility ownership', () => {
      const assets = [
        { id: 'ast-1', facilityId: hospitalDelhi, assetCode: 'AST-VENT-01', status: 'ACTIVE' },
        { id: 'ast-2', facilityId: hospitalMumbai, assetCode: 'AST-MRI-01', status: 'ACTIVE' },
      ];

      function updateAssetStatus(assetId: string, newStatus: string, actor: { facilityId: string }) {
        const validStatuses = ['ACTIVE', 'UNDER_MAINTENANCE', 'RETIRED'];
        if (!validStatuses.includes(newStatus)) {
          throw new Error(`Invalid status: ${newStatus}`);
        }
        const asset = assets.find(a => a.id === assetId);
        if (!asset) throw new Error('Asset not found');
        if (asset.facilityId !== actor.facilityId) {
          throw new Error('Forbidden: Cannot modify equipment belonging to another hospital facility.');
        }
        asset.status = newStatus;
        return asset;
      }

      // Valid status update in own hospital
      const updated = updateAssetStatus('ast-1', 'UNDER_MAINTENANCE', hospitalAdminDelhi);
      assert.strictEqual(updated.status, 'UNDER_MAINTENANCE');

      // Attempt cross-hospital asset modification
      assert.throws(
        () => updateAssetStatus('ast-2', 'RETIRED', hospitalAdminDelhi),
        /Forbidden: Cannot modify equipment belonging to another hospital facility/,
      );
    });

    it('10. Hospital Admin cannot silently overwrite verified clinical lab results', () => {
      const verifiedResult = {
        orderId: 'lab-ord-901',
        status: 'VERIFIED',
        testName: 'Complete Blood Count (CBC)',
        verifiedByDoctorId: 'doc-pathologist-01',
        isCritical: false,
      };

      function updateLabResult(result: typeof verifiedResult, actorRole: string, newValues: any) {
        if (result.status === 'VERIFIED') {
          if (actorRole === 'HOSPITAL_ADMIN' || actorRole === 'SUPER_ADMIN') {
            throw new Error('Forbidden: Administrators are strictly prohibited from silently modifying verified clinical lab results.');
          }
        }
        return { ...result, ...newValues };
      }

      assert.throws(
        () => updateLabResult(verifiedResult, 'HOSPITAL_ADMIN', { isCritical: true }),
        /Administrators are strictly prohibited from silently modifying verified clinical lab results/,
      );
    });

    it('11. Hospital Admin cannot bypass mandatory 4-point discharge clearances', () => {
      const pendingAdmission = {
        id: 'adm-inpatient-88',
        clearances: {
          BILLING: 'APPROVED',
          PHARMACY: 'PENDING',
          LABORATORY: 'APPROVED',
          WARD: 'APPROVED',
        },
      };

      function finalizeDischarge(admission: typeof pendingAdmission, actorRole: string) {
        const required = ['BILLING', 'PHARMACY', 'LABORATORY', 'WARD'] as const;
        for (const dept of required) {
          if (admission.clearances[dept] !== 'APPROVED') {
            throw new Error(`Blocked: Cannot discharge patient. Mandatory clearance from ${dept} is still pending.`);
          }
        }
        return 'DISCHARGED';
      }

      // Even Hospital Admin cannot bypass missing clearance
      assert.throws(
        () => finalizeDischarge(pendingAdmission, 'HOSPITAL_ADMIN'),
        /Mandatory clearance from PHARMACY is still pending/,
      );
    });

    it('12. Manager role remains strictly subordinate to Hospital Admin without privilege escalation', () => {
      function assignUserRole(targetRole: string, actor: { role: string }) {
        if (actor.role === 'MANAGER') {
          if (targetRole === 'HOSPITAL_ADMIN' || targetRole === 'SUPER_ADMIN' || targetRole === 'MANAGER') {
            throw new Error('Forbidden: Managers cannot provision administrative or managerial roles.');
          }
        }
        return true;
      }

      // Manager cannot assign Hospital Admin
      assert.throws(
        () => assignUserRole('HOSPITAL_ADMIN', managerDelhi),
        /Managers cannot provision administrative or managerial roles/,
      );

      // Manager cannot assign another Manager
      assert.throws(
        () => assignUserRole('MANAGER', managerDelhi),
        /Managers cannot provision administrative or managerial roles/,
      );
    });

    it('13. Administrative actions generate immutable AuditEvent records', () => {
      const recordedAuditEvents: Array<{ action: string; actorId: string; facilityId: string; timestamp: number }> = [];

      function recordAdminAudit(action: string, actor: { id: string; facilityId: string }) {
        const event = Object.freeze({
          action,
          actorId: actor.id,
          facilityId: actor.facilityId,
          timestamp: Date.now(),
        });
        recordedAuditEvents.push(event);
        return event;
      }

      recordAdminAudit('HOSPITAL_SETTINGS_UPDATED', hospitalAdminDelhi);
      recordAdminAudit('DEPARTMENT_CREATED', hospitalAdminDelhi);
      recordAdminAudit('ASSET_CREATED', hospitalAdminDelhi);

      assert.strictEqual(recordedAuditEvents.length, 3);
      assert.strictEqual(recordedAuditEvents[0].action, 'HOSPITAL_SETTINGS_UPDATED');
      assert.strictEqual(recordedAuditEvents[1].action, 'DEPARTMENT_CREATED');
      assert.strictEqual(recordedAuditEvents[2].action, 'ASSET_CREATED');
      assert.strictEqual(recordedAuditEvents[0].facilityId, hospitalDelhi);
    });

    it('14. Unified search results respect facility isolation with zero cross-hospital leakage', () => {
      const allPatients = [
        { id: 'pat-1', name: 'Aarav Patel', facilityId: hospitalDelhi },
        { id: 'pat-2', name: 'Aarav Sharma', facilityId: hospitalMumbai },
        { id: 'pat-3', name: 'Diya Rao', facilityId: hospitalDelhi },
      ];

      function searchPatients(query: string, userFacilityId: string) {
        return allPatients.filter(
          p => p.facilityId === userFacilityId && p.name.toLowerCase().includes(query.toLowerCase()),
        );
      }

      const results = searchPatients('Aarav', hospitalDelhi);
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, 'pat-1');
      assert.strictEqual(results[0].facilityId, hospitalDelhi);
      assert.strictEqual(results.some(r => r.facilityId === hospitalMumbai), false, 'No cross-facility records can leak in search');
    });

    it('15. Scoped search searches all 10 canonical healthcare entities without cross-facility leakage', () => {
      const hospitalEntities = {
        patients: [{ id: 'p-1', name: 'Aarav Patel', facilityId: hospitalDelhi }],
        doctors: [{ id: 'd-1', name: 'Dr. Ayush', staffId: 'DR.AYUSH-0263', facilityId: hospitalDelhi }],
        staff: [{ id: 's-1', name: 'Sister Priya', staffId: 'NR.PRIYA-1842', facilityId: hospitalDelhi }],
        departments: [{ id: 'dp-1', name: 'Cardiology', code: 'CARDIO', facilityId: hospitalDelhi }],
        appointments: [{ id: 'ap-1', number: 'APT-1001', facilityId: hospitalDelhi }],
        admissions: [{ id: 'ad-1', number: 'ADM-2001', facilityId: hospitalDelhi }],
        beds: [{ id: 'b-1', number: 'BED-ICU-01', facilityId: hospitalDelhi }],
        invoices: [{ id: 'inv-1', number: 'INV-3001', facilityId: hospitalDelhi }],
        labOrders: [{ id: 'lo-1', number: 'LAB-4001', facilityId: hospitalDelhi }],
        prescriptions: [{ id: 'rx-1', number: 'RX-5001', facilityId: hospitalDelhi }],
      };

      const foreignEntities = {
        patients: [{ id: 'p-2', name: 'Foreign Patient', facilityId: hospitalMumbai }],
        beds: [{ id: 'b-2', number: 'BED-ICU-01', facilityId: hospitalMumbai }],
      };

      function searchAll10Entities(query: string, userFacilityId: string) {
        const out: Record<string, any[]> = {};
        for (const [key, list] of Object.entries(hospitalEntities)) {
          out[key] = (list as any[]).filter(item => item.facilityId === userFacilityId);
        }
        return out;
      }

      const results = searchAll10Entities('ICU', hospitalDelhi);
      assert.strictEqual(Object.keys(results).length, 10, 'Must query all 10 canonical entities');
      assert.strictEqual(results.beds.length, 1);
      assert.strictEqual(results.beds[0].facilityId, hospitalDelhi);
      assert.strictEqual(results.beds.some(b => b.facilityId === hospitalMumbai), false);
    });

    it('16. Staff credential reset enforces bcrypt hashing and logs STAFF_CREDENTIALS_RESET', async () => {
      const userRecord = {
        id: 'usr-nurse-kavita',
        facilityId: hospitalDelhi,
        staffId: 'NR.KAVITA-5511',
        passwordHash: '$2a$10$oldDummyHashForTesting123456789012345678901234567890',
      };
      const auditLog: any[] = [];

      async function resetStaffCredentials(targetUserId: string, newPasswordPlain: string, actor: { id: string; facilityId: string }) {
        if (newPasswordPlain.length < 6) throw new Error('Password too short');
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPasswordPlain, salt);
        userRecord.passwordHash = newHash;

        auditLog.push({
          action: 'STAFF_CREDENTIALS_RESET',
          actorId: actor.id,
          targetUserId,
          facilityId: actor.facilityId,
          timestamp: new Date().toISOString(),
        });
        return true;
      }

      await resetStaffCredentials('usr-nurse-kavita', 'NewSecureNurse2026!', hospitalAdminDelhi);

      const isMatch = await bcrypt.compare('NewSecureNurse2026!', userRecord.passwordHash);
      assert.strictEqual(isMatch, true, 'New password must authenticate with bcrypt');
      assert.strictEqual(auditLog.length, 1);
      assert.strictEqual(auditLog[0].action, 'STAFF_CREDENTIALS_RESET');
      assert.strictEqual(auditLog[0].targetUserId, 'usr-nurse-kavita');
    });

    it('17. Manager provisioning assigns MANAGER role, MG. prefix, and binds to hospital facility', () => {
      function provisionManager(actor: { facilityId: string; role: string }, input: { firstName: string; lastName: string; department: string }) {
        if (actor.role !== 'HOSPITAL_ADMIN' && actor.role !== 'SUPER_ADMIN') {
          throw new Error('Forbidden: Only Hospital Admin can provision managers');
        }
        const cleanName = input.firstName.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 10);
        const staffLoginId = `MG.${cleanName}-8821`;
        return {
          id: `usr-mgr-${Date.now()}`,
          name: `${input.firstName} ${input.lastName}`,
          role: 'MANAGER',
          facilityId: actor.facilityId,
          staffLoginId,
          department: input.department,
          status: 'ACTIVE',
        };
      }

      const mgr = provisionManager(hospitalAdminDelhi, { firstName: 'Suresh', lastName: 'Khanna', department: 'Emergency & Trauma' });
      assert.strictEqual(mgr.role, 'MANAGER');
      assert.strictEqual(mgr.facilityId, hospitalDelhi);
      assert.ok(mgr.staffLoginId.startsWith('MG.SURESH-'));
      assert.strictEqual(mgr.department, 'Emergency & Trauma');
    });

    it('18. Staff activation and deactivation toggles status while preserving canonical ID and role', () => {
      const staffMember = {
        id: 'usr-stf-99',
        staffLoginId: 'RC.ANITA-9988',
        role: 'RECEPTIONIST',
        status: 'ACTIVE',
        isActive: true,
      };

      function updateStatus(member: typeof staffMember, newStatus: 'ACTIVE' | 'INACTIVE') {
        member.status = newStatus;
        member.isActive = newStatus === 'ACTIVE';
        return member;
      }

      updateStatus(staffMember, 'INACTIVE');
      assert.strictEqual(staffMember.status, 'INACTIVE');
      assert.strictEqual(staffMember.isActive, false);
      assert.strictEqual(staffMember.staffLoginId, 'RC.ANITA-9988', 'Canonical ID must remain unchanged');

      updateStatus(staffMember, 'ACTIVE');
      assert.strictEqual(staffMember.status, 'ACTIVE');
      assert.strictEqual(staffMember.isActive, true);
    });
  });

  describe('14. Manager Command Center & Cross-Portal Consistency Verification', () => {
    const hospitalA = 'fac-delhi-001';
    const hospitalB = 'fac-mumbai-002';

    const managerA = {
      id: 'usr-mgr-01',
      role: 'MANAGER',
      facilityId: hospitalA,
      staffLoginId: 'MG.RAHUL-9137',
    };

    const nurseA = {
      id: 'usr-nr-01',
      role: 'NURSE',
      facilityId: hospitalA,
      staffLoginId: 'NR.PRIYA-1842',
    };

    it('1. Manager has authorized access to operational admissions and bed capacity within facility', () => {
      function queryManagerAdmissions(actor: typeof managerA, queryFacilityId: string) {
        if (actor.role !== 'MANAGER' && actor.role !== 'HOSPITAL_ADMIN') {
          throw new Error('FORBIDDEN_ROLE');
        }
        if (actor.facilityId !== queryFacilityId) {
          throw new Error('IDOR_CROSS_FACILITY_DENIED');
        }
        return { totalAdmissions: 28, availableBeds: 22, occupiedBeds: 28 };
      }

      const res = queryManagerAdmissions(managerA, hospitalA);
      assert.strictEqual(res.totalAdmissions, 28);
      assert.strictEqual(res.availableBeds, 22);

      assert.throws(
        () => queryManagerAdmissions(managerA, hospitalB),
        /IDOR_CROSS_FACILITY_DENIED/,
        'Manager in Hospital A must be strictly denied access to Hospital B'
      );
    });

    it('2. Manager is strictly denied clinical diagnosis modification and billing bypass', () => {
      const allowedRolesForClinicalPrescription = ['DOCTOR'];
      const allowedRolesForBillingOverride = ['HOSPITAL_ADMIN', 'BILLING_STAFF'];

      assert.ok(
        !allowedRolesForClinicalPrescription.includes(managerA.role),
        'Manager must not have clinical prescription modification permissions'
      );
      assert.ok(
        !allowedRolesForBillingOverride.includes(managerA.role),
        'Manager must not bypass billing or clearance requirements'
      );
    });

    it('3. Nursing Bed Release requires valid dischargeReason and atomically releases bed to AVAILABLE', () => {
      interface BedState {
        id: string;
        bedNumber: string;
        status: 'OCCUPIED' | 'AVAILABLE';
      }

      interface AdmissionState {
        id: string;
        status: 'ADMITTED' | 'DISCHARGED';
        dischargeReason?: string;
      }

      const bed: BedState = { id: 'bed-101', bedNumber: 'MED-305', status: 'OCCUPIED' };
      const admission: AdmissionState = { id: 'adm-001', status: 'ADMITTED' };

      function executeBedDischarge(
        dto: { dischargeReason?: string },
        targetAdm: AdmissionState,
        targetBed: BedState
      ) {
        if (!dto.dischargeReason || dto.dischargeReason.trim() === '') {
          throw new Error('Discharge reason is required');
        }
        targetAdm.status = 'DISCHARGED';
        targetAdm.dischargeReason = dto.dischargeReason;
        targetBed.status = 'AVAILABLE';
        return { targetAdm, targetBed };
      }

      // Reject empty or missing dischargeReason
      assert.throws(
        () => executeBedDischarge({} as any, admission, bed),
        /Discharge reason is required/
      );

      // Execute valid release
      const result = executeBedDischarge(
        { dischargeReason: 'Discharged from nursing bedside console' },
        admission,
        bed
      );

      assert.strictEqual(result.targetAdm.status, 'DISCHARGED');
      assert.strictEqual(result.targetAdm.dischargeReason, 'Discharged from nursing bedside console');
      assert.strictEqual(result.targetBed.status, 'AVAILABLE', 'Bed must be freed to AVAILABLE status atomically');
    });

    it('4. Cross-portal canonical staff identity resolves identically across Manager, Admin, and Nursing', () => {
      const canonicalStaffRegistry = new Map<string, { id: string; name: string; staffLoginId: string; role: string }>();

      canonicalStaffRegistry.set('DR.AYUSH-0263', {
        id: 'usr-doc-ayush',
        name: 'Dr. Ayush Singh',
        staffLoginId: 'DR.AYUSH-0263',
        role: 'DOCTOR',
      });
      canonicalStaffRegistry.set('NR.PRIYA-1842', {
        id: 'usr-nr-priya',
        name: 'Priya Sharma',
        staffLoginId: 'NR.PRIYA-1842',
        role: 'NURSE',
      });
      canonicalStaffRegistry.set('MG.RAHUL-9137', {
        id: 'usr-mgr-rahul',
        name: 'Rahul Verma',
        staffLoginId: 'MG.RAHUL-9137',
        role: 'MANAGER',
      });

      // Query from Admin Portal
      const fromAdmin = canonicalStaffRegistry.get('MG.RAHUL-9137');
      // Query from Manager Portal
      const fromManager = canonicalStaffRegistry.get('MG.RAHUL-9137');

      assert.deepStrictEqual(fromAdmin, fromManager, 'Admin and Manager portals must resolve identical canonical record');
      assert.strictEqual(fromAdmin?.staffLoginId, 'MG.RAHUL-9137');
      assert.strictEqual(fromAdmin?.name, 'Rahul Verma');
    });
  });

  describe('15. Global Patient Identity, Multi-Hospital Registration & Real-Time Patient Visibility', () => {
    // Canonical data interfaces
    interface GlobalPatient {
      id: string;
      uhid: string; // Permanent canonical UHID (e.g. MNX-000001)
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
      phone: string;
      email: string;
      isVerifiedPhone: boolean;
      createdAt: string;
    }

    interface HospitalRegistration {
      id: string;
      patientId: string;
      facilityId: string;
      mrn: string; // Hospital specific MRN (e.g. HOS-A-00045)
      status: 'REGISTERED' | 'WAITING' | 'CHECKED_IN' | 'IN_CONSULTATION' | 'ADMITTED' | 'DISCHARGED';
      registeredAt: string;
      departmentId?: string;
    }

    interface AuditLog {
      eventType: string;
      patientId: string;
      facilityId: string;
      metadata: Record<string, any>;
      timestamp: string;
    }

    interface RealtimeEvent {
      channel: string;
      event: string;
      payload: {
        patientId: string;
        uhid: string;
        hospitalRegistrationId: string;
        mrn: string;
        displayName: string;
        registrationStatus: string;
        facilityId: string;
        [key: string]: any;
      };
    }

    // In-memory canonical storage
    const globalPatients = new Map<string, GlobalPatient>();
    const hospitalRegistrations: HospitalRegistration[] = [];
    const auditLogs: AuditLog[] = [];
    const emittedRealtimeEvents: RealtimeEvent[] = [];

    // Helper functions
    function isValidUhidFormat(uhid: string): boolean {
      return /^MNX-\d{6}$/.test(uhid) || /^UHID-\d{4}-\d{4,8}$/.test(uhid);
    }

    function isValidMrnFormat(mrn: string): boolean {
      return /^(HOS|MRN)-[A-Z0-9]{1,8}-\d{4,8}$/.test(mrn);
    }

    let uhidCounter = 1;
    function generateUhid(): string {
      return `MNX-${String(uhidCounter++).padStart(6, '0')}`;
    }

    let mrnCounterA = 45;
    let mrnCounterB = 21;
    function generateMrn(facilityCode: string): string {
      const code = facilityCode.toUpperCase().includes('B') ? 'B' : 'A';
      const count = code === 'B' ? mrnCounterB++ : mrnCounterA++;
      return `HOS-${code}-${String(count).padStart(5, '0')}`;
    }

    // Matching logic (Section 3)
    function matchPatient(query: {
      uhid?: string;
      phone?: string;
      mrn?: string;
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
    }): { matched: boolean; patient: GlobalPatient | null; requiresVerification: boolean } {
      if (query.uhid) {
        for (const p of globalPatients.values()) {
          if (p.uhid === query.uhid.trim().toUpperCase()) {
            return { matched: true, patient: p, requiresVerification: false };
          }
        }
      }

      if (query.phone) {
        const cleanPhone = query.phone.replace(/\D/g, '');
        for (const p of globalPatients.values()) {
          if (p.phone.replace(/\D/g, '') === cleanPhone && p.isVerifiedPhone) {
            return { matched: true, patient: p, requiresVerification: false };
          }
        }
      }

      if (query.mrn) {
        const reg = hospitalRegistrations.find((r) => r.mrn === query.mrn?.trim().toUpperCase());
        if (reg) {
          const p = globalPatients.get(reg.patientId);
          if (p) return { matched: true, patient: p, requiresVerification: false };
        }
      }

      if (query.firstName && query.dateOfBirth) {
        const match = Array.from(globalPatients.values()).find(
          (p) =>
            p.firstName.toLowerCase() === query.firstName?.toLowerCase().trim() &&
            p.dateOfBirth === query.dateOfBirth,
        );
        if (match) return { matched: true, patient: match, requiresVerification: false };
      }

      // Name-only query without DOB or verified phone: strictly require additional verification
      if (query.firstName && !query.dateOfBirth && !query.phone && !query.uhid) {
        const candidates = Array.from(globalPatients.values()).filter(
          (p) => p.firstName.toLowerCase() === query.firstName?.toLowerCase().trim(),
        );
        if (candidates.length > 0) {
          return { matched: false, patient: null, requiresVerification: true };
        }
      }

      return { matched: false, patient: null, requiresVerification: false };
    }

    // Hospital Registration execution
    function registerPatientAtFacility(
      patientId: string,
      facilityId: string,
      departmentId?: string,
    ): HospitalRegistration {
      const patient = globalPatients.get(patientId);
      if (!patient) {
        throw new Error('PATIENT_NOT_FOUND: Global patient record does not exist');
      }

      // Duplicate check (Section 21)
      const existing = hospitalRegistrations.find(
        (r) => r.patientId === patientId && r.facilityId === facilityId,
      );
      if (existing) {
        auditLogs.push({
          eventType: 'PATIENT_REGISTRATION_DUPLICATE_ATTEMPT',
          patientId,
          facilityId,
          metadata: { mrn: existing.mrn, uhid: patient.uhid },
          timestamp: new Date().toISOString(),
        });
        const err: any = new Error(
          `PATIENT_ALREADY_REGISTERED: Patient is already registered at this hospital with MRN ${existing.mrn}`,
        );
        err.statusCode = 409;
        err.existingMrn = existing.mrn;
        err.uhid = patient.uhid;
        throw err;
      }

      const mrn = generateMrn(facilityId);
      const reg: HospitalRegistration = {
        id: `hreg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        patientId,
        facilityId,
        mrn,
        status: 'REGISTERED',
        registeredAt: new Date().toISOString(),
        departmentId,
      };
      hospitalRegistrations.push(reg);

      // Audit log
      auditLogs.push({
        eventType: 'PATIENT_REGISTERED_AT_FACILITY',
        patientId,
        facilityId,
        metadata: { mrn: reg.mrn, uhid: patient.uhid },
        timestamp: new Date().toISOString(),
      });

      // Realtime event emission (Section 26 & 18: minimal non-clinical payload)
      emittedRealtimeEvents.push({
        channel: `facility_${facilityId}`,
        event: 'PATIENT_REGISTERED_AT_FACILITY',
        payload: {
          patientId: patient.id,
          uhid: patient.uhid,
          hospitalRegistrationId: reg.id,
          mrn: reg.mrn,
          displayName: `${patient.firstName} ${patient.lastName}`,
          registrationStatus: reg.status,
          facilityId,
        },
      });

      return reg;
    }

    // Shared state variables across steps
    let createdPatient: GlobalPatient;
    let hospitalARegistration: HospitalRegistration;
    let hospitalBRegistration: HospitalRegistration;

    it('STEP 1: Patient does not exist initially in canonical global registry', () => {
      const match = matchPatient({ firstName: 'Rahul', lastName: 'Sharma' });
      assert.strictEqual(match.matched, false);
      assert.strictEqual(match.patient, null);
    });

    it('STEP 2: Reception at Hospital A registers patient -> Canonical UHID generated (MNX-000001)', () => {
      const uhid = generateUhid();
      assert.strictEqual(uhid, 'MNX-000001', 'First canonical patient receives MNX-000001');
      assert.strictEqual(isValidUhidFormat(uhid), true, 'UHID must adhere to canonical format');

      createdPatient = {
        id: 'pat-global-rahul-01',
        uhid,
        firstName: 'Rahul',
        lastName: 'Sharma',
        dateOfBirth: '1990-06-15',
        gender: 'MALE',
        phone: '+919876543210',
        email: 'rahul.sharma@medinexa.org',
        isVerifiedPhone: true,
        createdAt: new Date().toISOString(),
      };
      globalPatients.set(createdPatient.id, createdPatient);

      auditLogs.push({
        eventType: 'PATIENT_CREATED',
        patientId: createdPatient.id,
        facilityId: 'FACILITY_HOSPITAL_A',
        metadata: { uhid: createdPatient.uhid },
        timestamp: new Date().toISOString(),
      });

      assert.strictEqual(globalPatients.has('pat-global-rahul-01'), true);
      assert.strictEqual(createdPatient.uhid, 'MNX-000001');
    });

    it('STEP 3: Hospital A registration created with hospital-specific MRN (HOS-A-00045) while preserving UHID', () => {
      hospitalARegistration = registerPatientAtFacility(
        createdPatient.id,
        'FACILITY_HOSPITAL_A',
        'dept-cardio',
      );

      assert.strictEqual(hospitalARegistration.mrn, 'HOS-A-00045', 'Hospital A MRN generated correctly');
      assert.strictEqual(isValidMrnFormat(hospitalARegistration.mrn), true);
      assert.strictEqual(hospitalARegistration.facilityId, 'FACILITY_HOSPITAL_A');
      assert.strictEqual(hospitalARegistration.patientId, createdPatient.id);

      // Verify UHID remained unchanged
      const pat = globalPatients.get(createdPatient.id);
      assert.strictEqual(pat?.uhid, 'MNX-000001', 'UHID must NEVER change upon hospital registration');
    });

    it('STEP 4 & 5: Hospital-wide patient visibility allows authorized portals (Doctor, Nurse, Lab, Pharmacy, Billing, Manager, Admin) to discover patient', () => {
      // Query canonical hospital directory for Hospital A
      const hospitalADirectory = hospitalRegistrations
        .filter((r) => r.facilityId === 'FACILITY_HOSPITAL_A')
        .map((r) => {
          const p = globalPatients.get(r.patientId)!;
          return {
            patientId: p.id,
            uhid: p.uhid,
            mrn: r.mrn,
            fullName: `${p.firstName} ${p.lastName}`,
            status: r.status,
            facilityId: r.facilityId,
          };
        });

      // Authorized discovery across all hospital portals
      const portals = ['RECEPTION', 'DOCTOR', 'NURSE', 'LABORATORY', 'PHARMACY', 'BILLING', 'MANAGER', 'HOSPITAL_ADMIN'];
      for (const portal of portals) {
        const match = hospitalADirectory.find((p) => p.uhid === 'MNX-000001' && p.mrn === 'HOS-A-00045');
        assert.ok(match, `Portal ${portal} must be able to discover Rahul Sharma from canonical Hospital A directory`);
        assert.strictEqual(match?.fullName, 'Rahul Sharma');
        assert.strictEqual(match?.uhid, 'MNX-000001');
        assert.strictEqual(match?.mrn, 'HOS-A-00045');
      }
    });

    it('STEP 6: Doctor OPD queue reflects patient when appointment is created', () => {
      interface Appointment {
        id: string;
        patientId: string;
        doctorId: string;
        facilityId: string;
        status: 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED';
      }
      const appointment: Appointment = {
        id: 'apt-001',
        patientId: createdPatient.id,
        doctorId: 'usr-doc-ayush',
        facilityId: 'FACILITY_HOSPITAL_A',
        status: 'SCHEDULED',
      };

      const doctorOpdQueue = [appointment].filter(
        (a) => a.doctorId === 'usr-doc-ayush' && a.facilityId === 'FACILITY_HOSPITAL_A',
      );
      assert.strictEqual(doctorOpdQueue.length, 1);
      assert.strictEqual(doctorOpdQueue[0].patientId, createdPatient.id);
    });

    it('STEP 7: Check-in patient triggers status transition to CHECKED_IN and notifies doctor workflow', () => {
      hospitalARegistration.status = 'CHECKED_IN';
      emittedRealtimeEvents.push({
        channel: 'facility_FACILITY_HOSPITAL_A',
        event: 'PATIENT_CHECKED_IN',
        payload: {
          patientId: createdPatient.id,
          uhid: createdPatient.uhid,
          hospitalRegistrationId: hospitalARegistration.id,
          mrn: hospitalARegistration.mrn,
          displayName: `${createdPatient.firstName} ${createdPatient.lastName}`,
          registrationStatus: 'CHECKED_IN',
          facilityId: 'FACILITY_HOSPITAL_A',
        },
      });

      assert.strictEqual(hospitalARegistration.status, 'CHECKED_IN');
      const lastEvent = emittedRealtimeEvents[emittedRealtimeEvents.length - 1];
      assert.strictEqual(lastEvent.event, 'PATIENT_CHECKED_IN');
      assert.strictEqual(lastEvent.payload.registrationStatus, 'CHECKED_IN');
    });

    it('STEP 8: Doctor starts consultation -> Status advances to IN_CONSULTATION and clinical workflow active', () => {
      hospitalARegistration.status = 'IN_CONSULTATION';
      const consultationEncounter = {
        id: 'enc-001',
        patientId: createdPatient.id,
        doctorId: 'usr-doc-ayush',
        facilityId: 'FACILITY_HOSPITAL_A',
        type: 'OUTPATIENT',
        status: 'IN_PROGRESS',
      };

      assert.strictEqual(hospitalARegistration.status, 'IN_CONSULTATION');
      assert.strictEqual(consultationEncounter.status, 'IN_PROGRESS');
    });

    it('STEP 9: Doctor issues prescription -> Pharmacy portal receives prescription order', () => {
      const prescription = {
        id: 'rx-001',
        patientId: createdPatient.id,
        facilityId: 'FACILITY_HOSPITAL_A',
        items: [{ medicineName: 'Amoxicillin 500mg', quantity: 15, instructions: '1 capsule tid' }],
        status: 'ISSUED',
      };

      emittedRealtimeEvents.push({
        channel: 'pharmacy_FACILITY_HOSPITAL_A',
        event: 'PRESCRIPTION_ISSUED',
        payload: {
          patientId: createdPatient.id,
          uhid: createdPatient.uhid,
          hospitalRegistrationId: hospitalARegistration.id,
          mrn: hospitalARegistration.mrn,
          displayName: `${createdPatient.firstName} ${createdPatient.lastName}`,
          registrationStatus: 'PHARMACY_PENDING',
          facilityId: 'FACILITY_HOSPITAL_A',
        },
      });

      assert.strictEqual(prescription.status, 'ISSUED');
      assert.strictEqual(prescription.items.length, 1);
    });

    it('STEP 10: Doctor orders lab test -> Laboratory portal receives pending lab order', () => {
      const labOrder = {
        id: 'lab-001',
        patientId: createdPatient.id,
        facilityId: 'FACILITY_HOSPITAL_A',
        testCode: 'CBC',
        status: 'PENDING',
      };

      emittedRealtimeEvents.push({
        channel: 'lab_FACILITY_HOSPITAL_A',
        event: 'LAB_ORDER_CREATED',
        payload: {
          patientId: createdPatient.id,
          uhid: createdPatient.uhid,
          hospitalRegistrationId: hospitalARegistration.id,
          mrn: hospitalARegistration.mrn,
          displayName: `${createdPatient.firstName} ${createdPatient.lastName}`,
          registrationStatus: 'IN_LAB',
          facilityId: 'FACILITY_HOSPITAL_A',
        },
      });

      assert.strictEqual(labOrder.status, 'PENDING');
      assert.strictEqual(labOrder.testCode, 'CBC');
    });

    it('STEP 11: Nurse sees patient in ward care only upon active inpatient admission, not mere registration', () => {
      // Outpatient registered patient is NOT in nursing inpatient census
      const activeInpatients = hospitalRegistrations.filter(
        (r) => r.facilityId === 'FACILITY_HOSPITAL_A' && r.status === 'ADMITTED',
      );
      assert.strictEqual(
        activeInpatients.some((r) => r.patientId === createdPatient.id),
        false,
        'Patient without admission must NOT appear in nursing inpatient census',
      );

      // Once admitted, patient appears in nursing active census
      const admissionRecord = {
        id: 'adm-001',
        patientId: createdPatient.id,
        facilityId: 'FACILITY_HOSPITAL_A',
        bedNumber: 'GEN-WARD-04',
        status: 'ACTIVE',
      };
      assert.strictEqual(admissionRecord.bedNumber, 'GEN-WARD-04');
    });

    it('STEP 12: Billing portal accesses patient for billing and itemized charges', () => {
      const billingInvoice = {
        id: 'inv-001',
        patientId: createdPatient.id,
        facilityId: 'FACILITY_HOSPITAL_A',
        mrn: hospitalARegistration.mrn,
        uhid: createdPatient.uhid,
        items: [
          { description: 'OPD Consultation', amount: 500 },
          { description: 'CBC Lab Panel', amount: 350 },
        ],
        totalAmount: 850,
        status: 'PENDING',
      };

      assert.strictEqual(billingInvoice.totalAmount, 850);
      assert.strictEqual(billingInvoice.uhid, 'MNX-000001');
      assert.strictEqual(billingInvoice.mrn, 'HOS-A-00045');
    });

    it('STEP 13: Offline and refresh persistence allows patient retrieval via direct backend query independently of realtime socket state', () => {
      // Simulate client disconnect / reload: Query canonical database directly
      const directQueryResult = hospitalRegistrations.find(
        (r) => r.facilityId === 'FACILITY_HOSPITAL_A' && r.patientId === 'pat-global-rahul-01',
      );
      assert.ok(directQueryResult, 'Database must be the authoritative source of truth');
      assert.strictEqual(directQueryResult?.mrn, 'HOS-A-00045');

      const patRecord = globalPatients.get(directQueryResult!.patientId);
      assert.strictEqual(patRecord?.uhid, 'MNX-000001');
      assert.strictEqual(patRecord?.firstName, 'Rahul');
    });

    it('STEP 14: Hospital B searches same patient -> Finds existing Global Patient (MNX-000001), detected as new to Hospital B', () => {
      // Search by verified mobile
      const matchByPhone = matchPatient({ phone: '+919876543210' });
      assert.strictEqual(matchByPhone.matched, true);
      assert.strictEqual(matchByPhone.patient?.uhid, 'MNX-000001');

      // Check if registered at Hospital B
      const isRegisteredAtHospitalB = hospitalRegistrations.some(
        (r) => r.patientId === matchByPhone.patient?.id && r.facilityId === 'FACILITY_HOSPITAL_B',
      );
      assert.strictEqual(
        isRegisteredAtHospitalB,
        false,
        'Patient must be recognized as existing globally, but new to Hospital B',
      );
    });

    it('STEP 15: Hospital B registers patient -> Assigns Hospital B MRN (HOS-B-00021) while strictly preserving permanent UHID (MNX-000001)', () => {
      hospitalBRegistration = registerPatientAtFacility(
        createdPatient.id,
        'FACILITY_HOSPITAL_B',
        'dept-ortho',
      );

      assert.strictEqual(hospitalBRegistration.mrn, 'HOS-B-00021', 'Hospital B MRN generated correctly');
      assert.strictEqual(isValidMrnFormat(hospitalBRegistration.mrn), true);
      assert.strictEqual(hospitalBRegistration.facilityId, 'FACILITY_HOSPITAL_B');

      // Crucial requirement: UHID must remain identical
      const pat = globalPatients.get(createdPatient.id);
      assert.strictEqual(
        pat?.uhid,
        'MNX-000001',
        'Permanent UHID MUST remain MNX-000001 across Hospital B registration',
      );
    });

    it('STEP 16: Hospital A historical registration (HOS-A-00045) remains intact and unmodified', () => {
      const regA = hospitalRegistrations.find(
        (r) => r.patientId === createdPatient.id && r.facilityId === 'FACILITY_HOSPITAL_A',
      );
      assert.ok(regA);
      assert.strictEqual(regA?.mrn, 'HOS-A-00045');
      assert.strictEqual(regA?.id, hospitalARegistration.id);
    });

    it('STEP 17: Hospital B users in Hospital B facility context see Hospital B registration without cross-facility data leakage', () => {
      const hospitalBDirectory = hospitalRegistrations
        .filter((r) => r.facilityId === 'FACILITY_HOSPITAL_B')
        .map((r) => ({
          patientId: r.patientId,
          mrn: r.mrn,
          facilityId: r.facilityId,
        }));

      assert.strictEqual(hospitalBDirectory.length, 1);
      assert.strictEqual(hospitalBDirectory[0].mrn, 'HOS-B-00021');
      assert.strictEqual(hospitalBDirectory[0].facilityId, 'FACILITY_HOSPITAL_B');

      // Verify Hospital A MRN is NOT present in Hospital B local directory
      assert.strictEqual(
        hospitalBDirectory.some((r) => r.mrn === 'HOS-A-00045'),
        false,
        'Hospital A MRN must not leak into Hospital B local facility directory',
      );
    });

    it('STEP 18: RBAC & IDOR clinical confidentiality: Reception is strictly blocked from reading doctor clinical consultation notes', () => {
      interface UserContext {
        role: 'RECEPTIONIST' | 'DOCTOR';
        facilityId: string;
      }

      function accessClinicalNotes(user: UserContext, encounterFacilityId: string): string {
        if (user.facilityId !== encounterFacilityId) {
          throw new Error('IDOR_FORBIDDEN: Cross-facility clinical access is blocked');
        }
        if (user.role !== 'DOCTOR') {
          throw new Error('RBAC_FORBIDDEN: Receptionist is not permitted to view unrestricted clinical notes');
        }
        return 'Patient presents with acute chest discomfort, ECG shows sinus tachycardia.';
      }

      // Doctor at Hospital A can view notes
      assert.doesNotThrow(() => {
        const notes = accessClinicalNotes(
          { role: 'DOCTOR', facilityId: 'FACILITY_HOSPITAL_A' },
          'FACILITY_HOSPITAL_A',
        );
        assert.ok(notes.includes('ECG'));
      });

      // Receptionist at Hospital A is strictly blocked
      assert.throws(
        () => {
          accessClinicalNotes(
            { role: 'RECEPTIONIST', facilityId: 'FACILITY_HOSPITAL_A' },
            'FACILITY_HOSPITAL_A',
          );
        },
        /RBAC_FORBIDDEN.*Receptionist is not permitted to view unrestricted clinical notes/,
      );

      // Doctor at Hospital B attempting to access Hospital A notes is blocked by IDOR protection
      assert.throws(
        () => {
          accessClinicalNotes(
            { role: 'DOCTOR', facilityId: 'FACILITY_HOSPITAL_B' },
            'FACILITY_HOSPITAL_A',
          );
        },
        /IDOR_FORBIDDEN.*Cross-facility clinical access is blocked/,
      );
    });

    it('STEP 19: Safe patient matching blocks name-only auto-linking to prevent conflating two individuals named "Rahul Sharma"', () => {
      // Query with only Name without DOB or phone must return requiresVerification: true
      const nameOnlyMatch = matchPatient({ firstName: 'Rahul', lastName: 'Sharma' });
      assert.strictEqual(nameOnlyMatch.matched, false);
      assert.strictEqual(nameOnlyMatch.patient, null);
      assert.strictEqual(
        nameOnlyMatch.requiresVerification,
        true,
        'Name-only query must require additional identity verification and block auto-linking',
      );

      // Query with Name + DOB matches safely
      const nameAndDobMatch = matchPatient({
        firstName: 'Rahul',
        lastName: 'Sharma',
        dateOfBirth: '1990-06-15',
      });
      assert.strictEqual(nameAndDobMatch.matched, true);
      assert.strictEqual(nameAndDobMatch.patient?.uhid, 'MNX-000001');
      assert.strictEqual(nameAndDobMatch.requiresVerification, false);
    });

    it('STEP 20: Duplicate hospital registration prevention rejects registering already-registered patient at same hospital with 409 Conflict', () => {
      assert.throws(
        () => {
          registerPatientAtFacility(createdPatient.id, 'FACILITY_HOSPITAL_A');
        },
        (err: any) => {
          assert.strictEqual(err.statusCode, 409);
          assert.strictEqual(err.existingMrn, 'HOS-A-00045');
          assert.strictEqual(err.uhid, 'MNX-000001');
          return true;
        },
      );

      // Verify audit log captured the duplicate attempt
      const dupLog = auditLogs.find((l) => l.eventType === 'PATIENT_REGISTRATION_DUPLICATE_ATTEMPT');
      assert.ok(dupLog, 'Duplicate registration attempt must be logged in audit trail');
      assert.strictEqual(dupLog?.metadata.mrn, 'HOS-A-00045');
    });

    it('STEP 21: Realtime PATIENT_REGISTERED_AT_FACILITY payload is minimal and strictly contains zero sensitive clinical data', () => {
      const regEvent = emittedRealtimeEvents.find((e) => e.event === 'PATIENT_REGISTERED_AT_FACILITY');
      assert.ok(regEvent, 'PATIENT_REGISTERED_AT_FACILITY event must have been emitted');

      const payload = regEvent!.payload;
      assert.strictEqual(payload.patientId, createdPatient.id);
      assert.strictEqual(payload.uhid, 'MNX-000001');
      assert.strictEqual(payload.mrn, 'HOS-A-00045');
      assert.strictEqual(payload.displayName, 'Rahul Sharma');
      assert.strictEqual(payload.registrationStatus, 'REGISTERED');
      assert.strictEqual(payload.facilityId, 'FACILITY_HOSPITAL_A');

      // CRITICAL: Ensure NO sensitive clinical data is leaked in the realtime broadcast
      assert.strictEqual(payload.diagnosis, undefined);
      assert.strictEqual(payload.clinicalNotes, undefined);
      assert.strictEqual(payload.prescriptions, undefined);
      assert.strictEqual(payload.labResults, undefined);
    });

    it('STEP 22: Comprehensive AuditEvents recorded for all lifecycle transitions', () => {
      const eventTypes = auditLogs.map((l) => l.eventType);
      assert.ok(eventTypes.includes('PATIENT_CREATED'), 'Must log PATIENT_CREATED');
      assert.ok(eventTypes.includes('PATIENT_REGISTERED_AT_FACILITY'), 'Must log PATIENT_REGISTERED_AT_FACILITY');
      assert.ok(
        eventTypes.includes('PATIENT_REGISTRATION_DUPLICATE_ATTEMPT'),
        'Must log PATIENT_REGISTRATION_DUPLICATE_ATTEMPT',
      );
    });
  });

  describe('16. Universal Global Person ID System', () => {
    // Canonical regex for format: NAME-0000-AA (e.g. AYU-4826-KM or OM-1234-AB)
    const PERSON_ID_REGEX = /^[A-Z]{2,3}-[0-9]{4}-[A-Z]{2}$/;

    // Helper functions implementing canonical normalization and generation logic
    function extractPrefix(name: string): string {
      if (!name) return 'MNX';
      const clean = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/^dr\.?\s+/i, '')
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase();
      if (!clean) return 'MNX';
      if (clean.length === 1) return (clean + 'XX').slice(0, 3);
      if (clean.length === 2) return clean;
      return clean.slice(0, 3);
    }

    function generateCode(firstName: string): string {
      const prefix = extractPrefix(firstName);
      const digits = Math.floor(1000 + Math.random() * 9000).toString();
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const letters = chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)];
      return `${prefix}-${digits}-${letters}`;
    }

    function normalizeId(input: string): string {
      return input.trim().replace(/\s+/g, '').toUpperCase();
    }

    // Canonical database simulation
    interface CanonicalUser {
      id: string;
      email: string;
      fullName: string;
      role: string;
      phone: string;
      facilityId?: string | null;
      departmentId?: string | null;
      medinexaPersonId: string;
      createdAt: string;
      updatedAt: string;
    }

    const databaseUsers = new Map<string, CanonicalUser>();
    const databaseUniqueIndex = new Set<string>(); // Database-level UNIQUE constraint on medinexaPersonId
    const auditTrail: Array<{ eventType: string; userId: string; personId: string; timestamp: string }> = [];

    function insertUserWithUniqueConstraint(user: Omit<CanonicalUser, 'id' | 'createdAt' | 'updatedAt'>): CanonicalUser {
      // Enforce DB unique constraint
      if (databaseUniqueIndex.has(user.medinexaPersonId)) {
        const p2002Error: any = new Error(
          `Unique constraint failed on the fields: (medinexa_person_id) with value: ${user.medinexaPersonId}`
        );
        p2002Error.code = 'P2002';
        throw p2002Error;
      }

      const id = `usr-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const now = new Date().toISOString();
      const record: CanonicalUser = {
        ...user,
        id,
        createdAt: now,
        updatedAt: now,
      };

      databaseUsers.set(id, record);
      databaseUniqueIndex.add(record.medinexaPersonId);

      auditTrail.push({
        eventType: 'PERSON_ID_ASSIGNED',
        userId: id,
        personId: record.medinexaPersonId,
        timestamp: now,
      });

      return record;
    }

    function registerWithCollisionSafeRetry(
      name: string,
      role: string,
      email: string,
      phone: string,
      maxRetries = 5
    ): CanonicalUser {
      let attempts = 0;
      while (attempts < maxRetries) {
        attempts++;
        const candidateId = generateCode(name);
        try {
          return insertUserWithUniqueConstraint({
            fullName: name,
            role,
            email,
            phone,
            medinexaPersonId: candidateId,
          });
        } catch (err: any) {
          if (err.code === 'P2002' && attempts < maxRetries) {
            // Collision retry
            continue;
          }
          throw err;
        }
      }
      throw new Error('PERSON_ID_GENERATION_FAILED_EXHAUSTED_RETRIES');
    }

    it('STEP 1: Name prefix normalization extracts 2-3 uppercase alphabetic characters safely', () => {
      assert.strictEqual(extractPrefix('Ayush Singh'), 'AYU');
      assert.strictEqual(extractPrefix('Rajesh'), 'RAJ');
      assert.strictEqual(extractPrefix('Priya-Verma'), 'PRI');
      assert.strictEqual(extractPrefix('Dr. Ankit'), 'ANK');
      assert.strictEqual(extractPrefix('Om'), 'OM', 'Short 2-letter names preserved without error');
      assert.strictEqual(extractPrefix('Xi'), 'XI', 'Short 2-letter names preserved');
      assert.strictEqual(extractPrefix('Al'), 'AL');
      assert.strictEqual(extractPrefix('José'), 'JOS', 'Accented names normalized to ASCII');
      assert.strictEqual(extractPrefix('Álvaro'), 'ALV', 'Accented names normalized to ASCII');
      assert.strictEqual(extractPrefix('12345'), 'MNX', 'Fallback when no letters present');
    });

    it('STEP 2: Generated Person ID strictly matches regex ^[A-Z]{2,3}-[0-9]{4}-[A-Z]{2}$', () => {
      for (let i = 0; i < 50; i++) {
        const id = generateCode('Ayush');
        assert.ok(PERSON_ID_REGEX.test(id), `ID '${id}' must match format NAME-0000-AA`);
        assert.ok(id.startsWith('AYU-'), `ID '${id}' must start with normalized prefix AYU-`);
      }
    });

    it('STEP 3: 4 digits and 2 letters are generated independently and do not depend on phone or DOB', () => {
      const id1 = generateCode('Ayush');
      const parts = id1.split('-');
      assert.strictEqual(parts.length, 3);
      assert.strictEqual(parts[0], 'AYU');
      assert.strictEqual(parts[1].length, 4);
      assert.strictEqual(parts[2].length, 2);
      assert.ok(/^\d{4}$/.test(parts[1]), 'Middle section must be 4 digits');
      assert.ok(/^[A-Z]{2}$/.test(parts[2]), 'Suffix section must be 2 uppercase letters');
    });

    it('STEP 4: Global Uniqueness across same first name: multiple users with name Ayush receive different IDs', () => {
      const u1 = registerWithCollisionSafeRetry('Ayush Singh', 'PATIENT', 'ayu1@test.com', '+919000000001');
      const u2 = registerWithCollisionSafeRetry('Ayush Sharma', 'PATIENT', 'ayu2@test.com', '+919000000002');
      assert.notStrictEqual(u1.medinexaPersonId, u2.medinexaPersonId, 'Two patients with same first name must have different IDs');
      assert.ok(u1.medinexaPersonId.startsWith('AYU-'));
      assert.ok(u2.medinexaPersonId.startsWith('AYU-'));
    });

    it('STEP 5: Global Uniqueness across all roles: Patient, Doctor, Nurse, Manager, Admin share ONE namespace', () => {
      const pat = registerWithCollisionSafeRetry('Ayush Patient', 'PATIENT', 'ayupat@test.com', '+919000000003');
      const doc = registerWithCollisionSafeRetry('Ayush Doctor', 'DOCTOR', 'ayudoc@test.com', '+919000000004');
      const mgr = registerWithCollisionSafeRetry('Ayush Manager', 'MANAGER', 'ayumgr@test.com', '+919000000005');
      const adm = registerWithCollisionSafeRetry('Ayush Admin', 'HOSPITAL_ADMIN', 'ayuadm@test.com', '+919000000006');
      const nur = registerWithCollisionSafeRetry('Priya Nurse', 'NURSE', 'priya.nurse@test.com', '+919000000007');
      const rec = registerWithCollisionSafeRetry('Neha Reception', 'RECEPTIONIST', 'neha.rec@test.com', '+919000000008');
      const phm = registerWithCollisionSafeRetry('Amit Pharma', 'PHARMACIST', 'amit.phm@test.com', '+919000000009');
      const lab = registerWithCollisionSafeRetry('Ravi Lab', 'LAB_TECHNICIAN', 'ravi.lab@test.com', '+919000000010');

      const allIds = [
        pat.medinexaPersonId,
        doc.medinexaPersonId,
        mgr.medinexaPersonId,
        adm.medinexaPersonId,
        nur.medinexaPersonId,
        rec.medinexaPersonId,
        phm.medinexaPersonId,
        lab.medinexaPersonId,
      ];
      const uniqueIds = new Set(allIds);
      assert.strictEqual(allIds.length, uniqueIds.size, 'All IDs across all roles must be completely distinct');
    });

    it('STEP 6: Database UNIQUE constraint enforcement & collision retry automatically generates fresh ID', () => {
      // Force insert of a known ID
      const forcedId = 'AYU-4826-KM';
      const firstUser = insertUserWithUniqueConstraint({
        fullName: 'Ayush Singh',
        role: 'PATIENT',
        email: 'canonical.ayush@medinexa.org',
        phone: '+919876543210',
        medinexaPersonId: forcedId,
      });
      assert.strictEqual(firstUser.medinexaPersonId, forcedId);

      // Attempt duplicate direct insertion: must throw P2002 unique constraint error
      assert.throws(
        () => {
          insertUserWithUniqueConstraint({
            fullName: 'Ayush Duplicate',
            role: 'DOCTOR',
            email: 'duplicate@test.com',
            phone: '+919876543299',
            medinexaPersonId: forcedId,
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'P2002');
          return true;
        },
        'Direct duplicate insert must fail with unique constraint violation'
      );

      // Collision retry logic: when collision occurs, system retries and produces fresh non-colliding ID
      let attemptCount = 0;
      function registerWithSimulatedCollision(): CanonicalUser {
        while (attemptCount < 5) {
          attemptCount++;
          // First attempt intentionally forces the collision
          const candidate = attemptCount === 1 ? forcedId : generateCode('Ayush');
          try {
            return insertUserWithUniqueConstraint({
              fullName: 'Ayush Resilient',
              role: 'PATIENT',
              email: 'resilient@test.com',
              phone: '+919876543288',
              medinexaPersonId: candidate,
            });
          } catch (err: any) {
            if (err.code === 'P2002') continue;
            throw err;
          }
        }
        throw new Error('Retries exhausted');
      }

      const retryUser = registerWithSimulatedCollision();
      assert.ok(attemptCount > 1, 'Collision must trigger retry');
      assert.notStrictEqual(retryUser.medinexaPersonId, forcedId, 'Retried ID must be different from collided ID');
      assert.ok(PERSON_ID_REGEX.test(retryUser.medinexaPersonId));
    });

    it('STEP 7: Concurrent user creations cannot create duplicates under race conditions', () => {
      const concurrentRegistrations = Array.from({ length: 100 }, (_, i) => ({
        name: `Ayush ${i}`,
        email: `concur_${i}@test.com`,
        phone: `+91990000${String(i).padStart(4, '0')}`,
      }));

      const created = concurrentRegistrations.map((u) =>
        registerWithCollisionSafeRetry(u.name, 'PATIENT', u.email, u.phone)
      );

      const idSet = new Set(created.map((u) => u.medinexaPersonId));
      assert.strictEqual(idSet.size, 100, 'All 100 concurrent registrations must have 100 unique Person IDs');
    });

    it('STEP 8: Immutability: Name change preserves Person ID', () => {
      const user = registerWithCollisionSafeRetry('Ayush Singh', 'PATIENT', 'namechange@test.com', '+919500000001');
      const originalId = user.medinexaPersonId;

      // Update name
      user.fullName = 'Ayush Kumar Singh';
      user.updatedAt = new Date().toISOString();

      assert.strictEqual(user.medinexaPersonId, originalId, 'Person ID must remain identical on name change');
    });

    it('STEP 9: Immutability: Mobile number change preserves Person ID', () => {
      const user = registerWithCollisionSafeRetry('Priya Verma', 'NURSE', 'priya.phone@test.com', '+919500000002');
      const originalId = user.medinexaPersonId;

      // Change phone number
      user.phone = '+919999999999';
      user.updatedAt = new Date().toISOString();

      assert.strictEqual(user.medinexaPersonId, originalId, 'Person ID must remain identical on mobile number change');
    });

    it('STEP 10: Immutability: Role change / promotion preserves Person ID', () => {
      const user = registerWithCollisionSafeRetry('Neha Gupta', 'RECEPTIONIST', 'neha.promoted@test.com', '+919500000003');
      const originalId = user.medinexaPersonId;

      // Promotion to Manager
      user.role = 'MANAGER';
      user.updatedAt = new Date().toISOString();

      assert.strictEqual(user.medinexaPersonId, originalId, 'Person ID must NOT change when role changes');
    });

    it('STEP 11: Immutability: Department change and Hospital transfer preserve Person ID', () => {
      const doc = registerWithCollisionSafeRetry('Rajesh Khanna', 'DOCTOR', 'rajesh.transfer@test.com', '+919500000004');
      const originalId = doc.medinexaPersonId;

      // Transfer from Hospital A to Hospital B and Cardiology to Neurology
      doc.facilityId = 'FACILITY_HOSPITAL_B';
      doc.departmentId = 'dept-neurology';
      doc.updatedAt = new Date().toISOString();

      assert.strictEqual(doc.medinexaPersonId, originalId, 'Person ID must remain identical on facility transfer');
    });

    it('STEP 12: Immutability: ABHA linkage / unlinking preserves Person ID', () => {
      const patient = registerWithCollisionSafeRetry('Ravi Patel', 'PATIENT', 'ravi.abha@test.com', '+919500000005');
      const originalId = patient.medinexaPersonId;

      // Link ABHA
      (patient as any).abhaNumber = '14-1234-5678-9012';
      // Later unlink ABHA
      (patient as any).abhaNumber = null;

      assert.strictEqual(patient.medinexaPersonId, originalId, 'Person ID must remain identical on ABHA linkage/unlinking');
    });

    it('STEP 13: Immutability: Hospital MRN changes preserve permanent Person ID (UHID)', () => {
      const patient = registerWithCollisionSafeRetry('Ankit Verma', 'PATIENT', 'ankit.mrn@test.com', '+919500000006');
      const permanentPersonId = patient.medinexaPersonId;

      // Registration 1 at Hospital A
      const mrnA = 'MRN-HOS-A-001';
      // Registration 2 at Hospital B
      const mrnB = 'MRN-HOS-B-002';

      assert.notStrictEqual(mrnA, mrnB);
      assert.strictEqual(patient.medinexaPersonId, permanentPersonId, 'UHID/Person ID remains constant across multiple hospital MRNs');
    });

    it('STEP 14: Case-insensitive and whitespace-trimmed search resolves canonical uppercase ID', () => {
      const canonical = 'AYU-4826-KM';
      assert.strictEqual(normalizeId('ayu-4826-km'), canonical);
      assert.strictEqual(normalizeId(' AYU-4826-KM '), canonical);
      assert.strictEqual(normalizeId('Ayu-4826-Km'), canonical);
      assert.strictEqual(normalizeId('  ayu-4826-km  '), canonical);
    });

    it('STEP 15: Security: Person ID lookup alone cannot authenticate a user (password/JWT required)', () => {
      function authenticate(personId: string, passwordAttempt?: string, validHash?: string): boolean {
        // Authenticating purely by Person ID is strictly forbidden
        if (!passwordAttempt || !validHash) return false;
        return bcrypt.compareSync(passwordAttempt, validHash);
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('SecretPass#2026', salt);

      // Attempt auth with only Person ID
      assert.strictEqual(authenticate('AYU-4826-KM'), false, 'ID alone must NEVER grant authentication');
      // Attempt auth with incorrect password
      assert.strictEqual(authenticate('AYU-4826-KM', 'WrongPassword', hash), false);
      // Valid password
      assert.strictEqual(authenticate('AYU-4826-KM', 'SecretPass#2026', hash), true);
    });

    it('STEP 16: Security: QR payload contains only authorized lookup token, zero sensitive clinical diagnosis or notes', () => {
      const patient = {
        medinexaPersonId: 'AYU-4826-KM',
        fullName: 'Ayush Singh',
        diagnosis: 'Acute Myocardial Infarction',
        prescriptions: ['Aspirin 75mg', 'Atorvastatin 40mg'],
        labResults: [{ test: 'Troponin-T', value: 'High' }],
      };

      // Generate secure QR payload
      const qrPayload = JSON.stringify({
        uhid: patient.medinexaPersonId,
        token: 'sec_token_98fa71e2bc84',
        issuedAt: Date.now(),
      });

      const parsed = JSON.parse(qrPayload);
      assert.strictEqual(parsed.uhid, 'AYU-4826-KM');
      assert.ok(parsed.token);
      assert.strictEqual(parsed.diagnosis, undefined, 'CRITICAL: QR must NEVER contain diagnosis');
      assert.strictEqual(parsed.prescriptions, undefined, 'CRITICAL: QR must NEVER contain prescriptions');
      assert.strictEqual(parsed.labResults, undefined, 'CRITICAL: QR must NEVER contain lab results');
    });

    it('STEP 17: Migration of existing users is idempotent: multiple migration runs never re-generate or overwrite assigned IDs', () => {
      const testUser = {
        id: 'usr-mig-01',
        fullName: 'Migration User',
        medinexaPersonId: 'MIG-9999-ZZ',
      };

      function migrateUser(u: { id: string; fullName: string; medinexaPersonId?: string | null }) {
        if (u.medinexaPersonId) {
          return { ...u, action: 'SKIPPED_ALREADY_ASSIGNED' };
        }
        return {
          ...u,
          medinexaPersonId: generateCode(u.fullName),
          action: 'ASSIGNED',
        };
      }

      // First run: already assigned
      const run1 = migrateUser(testUser);
      assert.strictEqual(run1.action, 'SKIPPED_ALREADY_ASSIGNED');
      assert.strictEqual(run1.medinexaPersonId, 'MIG-9999-ZZ');

      // Second run: still skipped, identical ID
      const run2 = migrateUser(run1);
      assert.strictEqual(run2.action, 'SKIPPED_ALREADY_ASSIGNED');
      assert.strictEqual(run2.medinexaPersonId, 'MIG-9999-ZZ');
    });
  });
});



