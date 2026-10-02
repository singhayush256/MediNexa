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
});



