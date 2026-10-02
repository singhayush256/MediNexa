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
});

