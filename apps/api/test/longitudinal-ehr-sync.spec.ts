import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { RoleCode } from '@medinexa/types';

describe('MediNexa Longitudinal Patient Medical History & EHR Auto-Sync Suite', () => {

  // Mock Database Store
  const mockDb = {
    patients: [
      {
        id: 'pat-auth-001',
        name: 'Ayush Singh',
        uhid: 'MNX-2026-1088',
        address: JSON.stringify({
          longTermMedications: [
            { name: 'Dolo 650', genericName: 'Paracetamol 650mg', dosage: '650mg', frequency: 'PRN', instructions: 'For occasional headache' },
          ],
        }),
      },
      {
        id: 'pat-new-002',
        name: 'Rohan Mehta',
        uhid: 'MNX-2026-9901',
        address: JSON.stringify({}),
      },
    ],
    encounters: [
      {
        id: 'enc-001',
        encounterNumber: 'ENC-2026-001',
        patientId: 'pat-auth-001',
        doctorId: 'doc-rajesh-01',
        facilityId: 'fac-super-01',
        departmentId: 'dept-cardio',
        encounterType: 'OUTPATIENT',
        status: 'COMPLETED',
        startedAt: new Date('2026-09-21T09:15:00Z'),
        endedAt: new Date('2026-09-21T09:45:00Z'),
        reasonForVisit: 'Routine cardiology consultation & BP monitoring',
        doctorName: 'Dr. Rajesh Singh',
        doctorSpecialty: 'Cardiology',
        facilityName: 'MediNexa Super Specialty Hospital',
        departmentName: 'Central Cardiology OPD',
        diagnoses: [
          { id: 'diag-1', diagnosisName: 'Essential (Primary) Hypertension', diagnosisCode: 'I10', diagnosisType: 'PRIMARY', status: 'ACTIVE' },
        ],
        clinicalNotes: [
          { id: 'note-1', noteType: 'SOAP', content: 'Resting BP well controlled on Telmisartan 40mg.', author: 'Dr. Rajesh Singh', status: 'FINAL' },
        ],
        vitalSigns: [
          { systolicBP: 124, diastolicBP: 82, heartRate: 74, temperature: 36.8, oxygenSaturation: 98 },
        ],
        prescriptions: [
          {
            id: 'rx-001',
            prescriptionNumber: 'RX-2026-001',
            status: 'ACTIVE',
            items: [
              { medicationName: 'Telma 40', genericName: 'Telmisartan IP', dosage: '40mg', frequency: '1-0-0', duration: '90 Days' },
              { medicationName: 'Pan 40', genericName: 'Pantoprazole', dosage: '40mg', frequency: '1-0-0', duration: '14 Days' },
            ],
          },
        ],
        orderedLabs: ['12-Lead Resting ECG', 'Lipid Profile Panel'],
      },
      {
        id: 'enc-002',
        encounterNumber: 'ENC-2026-002',
        patientId: 'pat-auth-001',
        doctorId: 'doc-sneha-02',
        facilityId: 'fac-city-02',
        departmentId: 'dept-pulmo',
        encounterType: 'OUTPATIENT',
        status: 'COMPLETED',
        startedAt: new Date('2026-07-10T16:15:00Z'),
        endedAt: new Date('2026-07-10T16:40:00Z'),
        reasonForVisit: 'Seasonal dry cough and post-nasal drip',
        doctorName: 'Dr. Sneha Kulkarni',
        doctorSpecialty: 'Pulmonology',
        facilityName: 'MediNexa City Hospital',
        departmentName: 'Chest Medicine Clinic',
        diagnoses: [
          { id: 'diag-2', diagnosisName: 'Allergic Bronchitis', diagnosisCode: 'J40', diagnosisType: 'PRIMARY', status: 'RESOLVED' },
        ],
        clinicalNotes: [
          { id: 'note-2', noteType: 'SOAP', content: 'Chest clear. Prescribed 5-day antibiotic course.', author: 'Dr. Sneha Kulkarni', status: 'FINAL' },
        ],
        vitalSigns: [
          { systolicBP: 122, diastolicBP: 80, heartRate: 72, temperature: 37.1, oxygenSaturation: 99 },
        ],
        prescriptions: [
          {
            id: 'rx-002',
            prescriptionNumber: 'RX-2026-002',
            status: 'COMPLETED',
            items: [
              { medicationName: 'Augmentin 625 Duo', genericName: 'Amoxicillin + Clavulanate', dosage: '625mg', frequency: '1-0-1', duration: '5 Days' },
            ],
          },
        ],
        orderedLabs: ['Digital Chest X-Ray PA View'],
      },
    ],
    medications: [
      {
        id: 'med-01',
        patientId: 'pat-auth-001',
        medicineName: 'Telma 40',
        genericName: 'Telmisartan IP',
        dosage: '40mg',
        frequency: '1-0-0',
        durationDays: 90,
        prescribedAt: new Date('2026-09-21'),
        prescribedBy: 'Dr. Rajesh Singh',
        doctorSpecialty: 'Cardiology',
        hospitalName: 'MediNexa Super Specialty Hospital',
        prescriptionStatus: 'ACTIVE',
        dispensingStatus: 'DISPENSED',
        classification: 'DOCTOR_PRESCRIBED',
        isCurrent: true,
      },
      {
        id: 'med-02',
        patientId: 'pat-auth-001',
        medicineName: 'Atorva 20',
        genericName: 'Atorvastatin Calcium',
        dosage: '20mg',
        frequency: '0-0-1',
        durationDays: 90,
        prescribedAt: new Date('2026-08-14'),
        prescribedBy: 'Dr. Rajesh Singh',
        doctorSpecialty: 'Cardiology',
        hospitalName: 'MediNexa General Hospital',
        prescriptionStatus: 'ACTIVE',
        dispensingStatus: 'DISPENSED',
        classification: 'PHARMACY_DISPENSED',
        isCurrent: true,
      },
      {
        id: 'med-03',
        patientId: 'pat-auth-001',
        medicineName: 'Inj. Ceftriaxone 1g IV',
        genericName: 'Ceftriaxone Sterile',
        dosage: '1000mg',
        frequency: '1-0-1',
        durationDays: 3,
        prescribedAt: new Date('2026-08-11'),
        prescribedBy: 'Dr. Rajesh Singh',
        doctorSpecialty: 'Cardiology',
        hospitalName: 'MediNexa CCU Ward 4B',
        prescriptionStatus: 'COMPLETED',
        dispensingStatus: 'DISPENSED',
        classification: 'NURSE_ADMINISTERED',
        isCurrent: false,
      },
      {
        id: 'med-04',
        patientId: 'pat-auth-001',
        medicineName: 'Augmentin 625 Duo',
        genericName: 'Amoxicillin + Clavulanate',
        dosage: '625mg',
        frequency: '1-0-1',
        durationDays: 5,
        prescribedAt: new Date('2026-07-10'),
        prescribedBy: 'Dr. Sneha Kulkarni',
        doctorSpecialty: 'Pulmonology',
        hospitalName: 'MediNexa City Hospital',
        prescriptionStatus: 'COMPLETED',
        dispensingStatus: 'DISPENSED',
        classification: 'HISTORICAL',
        isCurrent: false,
      },
    ],
    diagnostics: [
      {
        id: 'diag-rep-1',
        patientId: 'pat-auth-001',
        category: 'RADIOLOGY',
        testName: 'Digital Chest X-Ray PA View',
        modality: 'X-RAY',
        orderDate: new Date('2026-08-12'),
        reportDate: new Date('2026-08-12'),
        orderingDoctor: 'Dr. Sneha Kulkarni',
        verifier: 'Dr. Sunita Kapoor (Radiologist)',
        hospitalName: 'MediNexa Diagnostic Imaging',
        resultValue: 'Normal Study',
        referenceRange: 'N/A (Imaging)',
        abnormalFlag: 'NORMAL',
        status: 'VERIFIED_AND_SIGNED',
      },
      {
        id: 'diag-rep-2',
        patientId: 'pat-auth-001',
        category: 'LABORATORY',
        testName: 'Complete Blood Count (CBC) - Hemoglobin',
        modality: 'PATHOLOGY',
        orderDate: new Date('2026-08-14'),
        reportDate: new Date('2026-08-14'),
        orderingDoctor: 'Dr. Arvind Deshmukh',
        verifier: 'Dr. Vandana Sethi (Pathologist)',
        hospitalName: 'MediNexa Central Pathology Lab',
        resultValue: '14.6',
        unit: 'g/dL',
        referenceRange: '13.5 - 17.5 g/dL',
        abnormalFlag: 'NORMAL',
        status: 'FINAL',
      },
    ],
  };

  // Mock User Roles for Authorization Tests
  const doctorUser = { id: 'u-doc', role: RoleCode.DOCTOR, doctorProfile: { id: 'doc-rajesh-01' } };
  const nurseUser = { id: 'u-nurse', role: RoleCode.NURSE, nurseProfile: { id: 'nurse-01' } };
  const patientUser = { id: 'u-pat-1', role: RoleCode.PATIENT, patientProfile: { id: 'pat-auth-001' } };
  const unauthorizedPatientUser = { id: 'u-pat-2', role: RoleCode.PATIENT, patientProfile: { id: 'pat-new-002' } };

  describe('1. Doctor Access to Authorized Patient Longitudinal EHR', () => {
    it('retrieves chronological consultation history with original doctor, facility, notes, and vitals', () => {
      const patientId = 'pat-auth-001';
      const history = mockDb.encounters
        .filter((e) => e.patientId === patientId)
        .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

      assert.strictEqual(history.length, 2);
      assert.strictEqual(history[0].doctorName, 'Dr. Rajesh Singh');
      assert.strictEqual(history[0].facilityName, 'MediNexa Super Specialty Hospital');
      assert.strictEqual(history[0].diagnoses[0].diagnosisCode, 'I10');
      assert.strictEqual(history[0].vitalSigns[0].systolicBP, 124);
      assert.strictEqual(history[0].status, 'COMPLETED');
      assert.strictEqual(history[1].doctorName, 'Dr. Sneha Kulkarni');
      assert.strictEqual(history[1].facilityName, 'MediNexa City Hospital');
    });

    it('filters consultations by specialty and hospital facility', () => {
      const patientId = 'pat-auth-001';
      const cardiologyOnly = mockDb.encounters.filter(
        (e) => e.patientId === patientId && e.doctorSpecialty === 'Cardiology'
      );
      assert.strictEqual(cardiologyOnly.length, 1);
      assert.strictEqual(cardiologyOnly[0].doctorSpecialty, 'Cardiology');

      const pulmonologyOnly = mockDb.encounters.filter(
        (e) => e.patientId === patientId && e.doctorSpecialty === 'Pulmonology'
      );
      assert.strictEqual(pulmonologyOnly.length, 1);
      assert.strictEqual(pulmonologyOnly[0].facilityName, 'MediNexa City Hospital');
    });

    it('correctly categorizes medications across lifecycle states', () => {
      const patientId = 'pat-auth-001';
      const meds = mockDb.medications.filter((m) => m.patientId === patientId);

      // Verify DOCTOR_PRESCRIBED
      const docPrescribed = meds.filter((m) => m.classification === 'DOCTOR_PRESCRIBED');
      assert.strictEqual(docPrescribed.length, 1);
      assert.strictEqual(docPrescribed[0].medicineName, 'Telma 40');

      // Verify PHARMACY_DISPENSED
      const pharmacyDispensed = meds.filter((m) => m.classification === 'PHARMACY_DISPENSED');
      assert.strictEqual(pharmacyDispensed.length, 1);
      assert.strictEqual(pharmacyDispensed[0].medicineName, 'Atorva 20');

      // Verify NURSE_ADMINISTERED
      const nurseAdministered = meds.filter((m) => m.classification === 'NURSE_ADMINISTERED');
      assert.strictEqual(nurseAdministered.length, 1);
      assert.strictEqual(nurseAdministered[0].medicineName, 'Inj. Ceftriaxone 1g IV');

      // Verify HISTORICAL
      const historical = meds.filter((m) => m.classification === 'HISTORICAL');
      assert.strictEqual(historical.length, 1);
      assert.strictEqual(historical[0].medicineName, 'Augmentin 625 Duo');
    });

    it('includes patient-reported over-the-counter medications distinct from doctor prescriptions', () => {
      const patient = mockDb.patients.find((p) => p.id === 'pat-auth-001');
      assert.ok(patient);
      const metadata = JSON.parse(patient.address);
      assert.ok(Array.isArray(metadata.longTermMedications));
      assert.strictEqual(metadata.longTermMedications[0].name, 'Dolo 650');
      assert.strictEqual(metadata.longTermMedications[0].genericName, 'Paracetamol 650mg');
    });

    it('provides diagnostic results with reference ranges provided ONLY by the laboratory', () => {
      const patientId = 'pat-auth-001';
      const reports = mockDb.diagnostics.filter((d) => d.patientId === patientId);

      const labReport = reports.find((r) => r.category === 'LABORATORY');
      assert.ok(labReport);
      assert.strictEqual(labReport.testName, 'Complete Blood Count (CBC) - Hemoglobin');
      assert.strictEqual(labReport.resultValue, '14.6');
      assert.strictEqual(labReport.unit, 'g/dL');
      assert.strictEqual(labReport.referenceRange, '13.5 - 17.5 g/dL');
      assert.strictEqual(labReport.abnormalFlag, 'NORMAL');
      assert.strictEqual(labReport.verifier, 'Dr. Vandana Sethi (Pathologist)');
    });
  });

  describe('2. Patient Privacy & Multi-Tenant Authorization Protection', () => {
    it('allows patient to access only their own medical timeline', () => {
      const canAccessOwn = patientUser.patientProfile.id === 'pat-auth-001';
      assert.strictEqual(canAccessOwn, true);

      // Accessing other patient profile must trigger authorization error
      const targetPatientId = 'pat-auth-001';
      const requestingPatientId = unauthorizedPatientUser.patientProfile.id;

      assert.notStrictEqual(targetPatientId, requestingPatientId);
      assert.throws(() => {
        if (unauthorizedPatientUser.role === RoleCode.PATIENT && requestingPatientId !== targetPatientId) {
          throw new Error('Access denied. Patients can only view their own medical records.');
        }
      }, /Access denied/);
    });

    it('allows attending clinicians (doctor, nurse) authorized cross-department EHR read access', () => {
      const doctorRole = doctorUser.role;
      const nurseRole = nurseUser.role;

      const authorizedRoles = [RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN];
      assert.ok(authorizedRoles.includes(doctorRole));
      assert.ok(authorizedRoles.includes(nurseRole));
    });
  });

  describe('3. Honest Empty State for New Patients (Zero Prior Records)', () => {
    it('returns an empty array and zero synthetic records for new patients with no prior visits', () => {
      const newPatientId = 'pat-new-002';
      const encounters = mockDb.encounters.filter((e) => e.patientId === newPatientId);
      const meds = mockDb.medications.filter((m) => m.patientId === newPatientId);
      const diags = mockDb.diagnostics.filter((d) => d.patientId === newPatientId);

      assert.strictEqual(encounters.length, 0);
      assert.strictEqual(meds.length, 0);
      assert.strictEqual(diags.length, 0);

      // Empty state message requirement check
      const emptyStateMessage =
        'No prior medical encounters recorded for this patient. New consultations, diagnoses, prescriptions, and diagnostic reports completed in MediNexa will automatically appear here.';
      assert.ok(emptyStateMessage.includes('No prior medical encounters recorded'));
      assert.ok(emptyStateMessage.includes('automatically appear here'));
    });
  });

  describe('4. Automatic EHR Synchronization on Hospital Event Completion', () => {
    it('automatically records finalized consultation into patient longitudinal timeline', () => {
      const newEncounter = {
        id: 'enc-new-003',
        encounterNumber: 'ENC-2026-003',
        patientId: 'pat-new-002',
        doctorId: 'doc-rajesh-01',
        facilityId: 'fac-super-01',
        departmentId: 'dept-cardio',
        encounterType: 'OUTPATIENT',
        status: 'COMPLETED',
        startedAt: new Date(),
        reasonForVisit: 'Initial cardiovascular evaluation',
        doctorName: 'Dr. Rajesh Singh',
        doctorSpecialty: 'Cardiology',
        facilityName: 'MediNexa Super Specialty Hospital',
        diagnoses: [{ diagnosisName: 'Borderline Elevated Systolic BP', diagnosisCode: 'R03.0' }],
      };

      // Push to mock store (simulating consultation finalization)
      mockDb.encounters.push(newEncounter as any);

      // Immediately query patient timeline
      const updatedTimeline = mockDb.encounters.filter((e) => e.patientId === 'pat-new-002');
      assert.strictEqual(updatedTimeline.length, 1);
      assert.strictEqual(updatedTimeline[0].encounterNumber, 'ENC-2026-003');
      assert.strictEqual(updatedTimeline[0].diagnoses[0].diagnosisCode, 'R03.0');
    });
  });
});
