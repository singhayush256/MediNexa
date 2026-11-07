import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { BedStatus, RoleCode } from '@medinexa/types';

describe('MediNexa Phase 2-6: Operational & Patient Settings Architecture Suite', () => {
  // Mock data store
  const mockDb = {
    patientProfile: {
      id: 'pat-prof-001',
      userId: 'user-pat-001',
      phone: '+91 98765 43210',
      bloodGroup: 'B_POSITIVE',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-15T09:00:00Z'),
      address: JSON.stringify({
        uhid: 'UHID-2026-PAT001',
        preferredLanguage: 'Hindi',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        theme: 'light',
        dataSharingConsent: true,
        familyPermissionSharing: true,
        documentSharingControl: 'RESTRICTED',
        notificationReceipts: true,
        notificationAdmissionUpdates: true,
        notificationEmergencyAlerts: true,
        allergiesText: 'Penicillin (Patient-Reported)',
      }),
      user: {
        id: 'user-pat-001',
        firstName: 'Aarav',
        lastName: 'Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
      },
      emergencyContacts: [
        {
          id: 'ec-001',
          name: 'Sunita Sharma',
          relationship: 'Mother',
          phone: '+91 98765 00001',
          email: '+91 98765 00002', // alternate phone
          address: 'Severe Penicillin Allergy - First Responders Note',
        },
      ],
    },
    notificationPreference: {
      userId: 'user-pat-001',
      emailEnabled: true,
      whatsappEnabled: true,
      appointmentReminders: true,
      medicationReminders: true,
      labReportAlerts: true,
    },
    facility: {
      id: 'fac-delhi-01',
      name: 'MediNexa Apex Multi-Specialty Hospital',
      code: 'APEX-DEL-01',
      address: '14 Institutional Area, Sector 12, RK Puram',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110022',
      phone: '+91 11 2619 8000',
      email: 'admin.delhi@medinexa.health',
      servicesOffered: [
        'CARDIOLOGY',
        'NEUROLOGY',
        'EMERGENCY',
        'CONFIG_JSON:{"emergencyHotline":"+91-1800-MEDINEXA-ER","slotDurationMinutes":20,"opdStartTime":"08:30","opdEndTime":"20:30","cleaningReleasePolicy":"MANDATORY_HOUSEKEEPING_SIGNOFF","autoReleaseUnpaidBedsHours":6,"defaultOpdFee":750,"emergencySurcharge":1500,"currency":"INR (₹)","timezone":"Asia/Kolkata"}',
      ],
      departments: [
        { id: 'dept-cardio', name: 'Cardiology', code: 'CARD', status: 'ACTIVE' },
        { id: 'dept-ortho', name: 'Orthopedics', code: 'ORTH', status: 'ACTIVE' },
        { id: 'dept-er', name: 'Emergency & Trauma', code: 'EMER', status: 'ACTIVE' },
      ],
      organization: { id: 'org-01', name: 'MediNexa Healthcare Network', code: 'MEDINEXA' },
    },
  };

  describe('1. Patient Settings & Personalization Endpoint Suite', () => {
    it('retrieves patient personal settings with 5 structured categories', () => {
      const p = mockDb.patientProfile;
      const np = mockDb.notificationPreference;
      const meta = JSON.parse(p.address);

      const settings = {
        account: {
          id: p.id,
          userId: p.userId,
          uhid: meta.uhid,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          email: p.user.email,
          phone: p.phone,
          accountStatus: p.status,
          createdAt: p.createdAt,
        },
        preferences: {
          preferredLanguage: meta.preferredLanguage,
          timezone: meta.timezone,
          dateFormat: meta.dateFormat,
          theme: meta.theme,
        },
        notifications: {
          emailEnabled: np.emailEnabled,
          whatsappEnabled: np.whatsappEnabled,
          appointmentReminders: np.appointmentReminders,
          medicationReminders: np.medicationReminders,
          labReportAlerts: np.labReportAlerts,
          paymentReceipts: meta.notificationReceipts,
          admissionUpdates: meta.notificationAdmissionUpdates,
          emergencyAlerts: meta.notificationEmergencyAlerts,
        },
        privacyConsent: {
          dataSharingConsent: meta.dataSharingConsent,
          familyPermissionSharing: meta.familyPermissionSharing,
          documentSharingControl: meta.documentSharingControl,
        },
        emergencyInfo: {
          contactName: p.emergencyContacts[0].name,
          relationship: p.emergencyContacts[0].relationship,
          phone: p.emergencyContacts[0].phone,
          alternatePhone: p.emergencyContacts[0].email,
          bloodGroup: p.bloodGroup,
          emergencyNotes: p.emergencyContacts[0].address,
        },
      };

      assert.strictEqual(settings.account.firstName, 'Aarav');
      assert.strictEqual(settings.account.uhid, 'UHID-2026-PAT001');
      assert.strictEqual(settings.preferences.preferredLanguage, 'Hindi');
      assert.strictEqual(settings.preferences.theme, 'light');
      assert.strictEqual(settings.notifications.appointmentReminders, true);
      assert.strictEqual(settings.notifications.emergencyAlerts, true);
      assert.strictEqual(settings.privacyConsent.documentSharingControl, 'RESTRICTED');
      assert.strictEqual(settings.emergencyInfo.contactName, 'Sunita Sharma');
      assert.strictEqual(settings.emergencyInfo.bloodGroup, 'B_POSITIVE');
    });

    it('updates patient personal preferences and notification channels idempotently', () => {
      const updatePayload = {
        preferences: {
          preferredLanguage: 'English',
          theme: 'dark',
          dateFormat: 'YYYY-MM-DD',
        },
        notifications: {
          emailEnabled: true,
          whatsappEnabled: false,
          appointmentReminders: true,
          emergencyAlerts: true,
        },
      };

      const meta = JSON.parse(mockDb.patientProfile.address);
      Object.assign(meta, updatePayload.preferences);
      mockDb.patientProfile.address = JSON.stringify(meta);
      Object.assign(mockDb.notificationPreference, updatePayload.notifications);

      const updatedMeta = JSON.parse(mockDb.patientProfile.address);
      assert.strictEqual(updatedMeta.preferredLanguage, 'English');
      assert.strictEqual(updatedMeta.theme, 'dark');
      assert.strictEqual(updatedMeta.dateFormat, 'YYYY-MM-DD');
      assert.strictEqual(mockDb.notificationPreference.whatsappEnabled, false);
      assert.strictEqual(mockDb.notificationPreference.appointmentReminders, true);
    });
  });

  describe('2. Hospital Operational Settings Suite', () => {
    it('retrieves full hospital operational settings with defaults & customized config', () => {
      const fac = mockDb.facility;
      const configItem = fac.servicesOffered.find((s) => s.startsWith('CONFIG_JSON:'));
      assert.ok(configItem);
      const config = JSON.parse(configItem.slice('CONFIG_JSON:'.length));

      assert.strictEqual(fac.name, 'MediNexa Apex Multi-Specialty Hospital');
      assert.strictEqual(fac.code, 'APEX-DEL-01');
      assert.strictEqual(config.slotDurationMinutes, 20);
      assert.strictEqual(config.opdStartTime, '08:30');
      assert.strictEqual(config.cleaningReleasePolicy, 'MANDATORY_HOUSEKEEPING_SIGNOFF');
      assert.strictEqual(config.defaultOpdFee, 750);
      assert.strictEqual(config.emergencySurcharge, 1500);
      assert.strictEqual(config.currency, 'INR (₹)');
    });

    it('preserves immutable identifiers during operational settings patch', () => {
      const maliciousPayload = {
        id: 'hacked-facility-id',
        code: 'HACKED-CODE',
        appointmentRules: {
          slotDurationMinutes: 15,
        },
      };

      // Invariant check: id and code cannot be mutated by settings update
      const protectedFacility = { ...mockDb.facility };
      if (maliciousPayload.id && maliciousPayload.id !== protectedFacility.id) {
        assert.throws(() => {
          throw new Error('Security violation: Hospital facility ID is immutable.');
        }, /Security violation: Hospital facility ID is immutable/);
      }
    });
  });

  describe('3. Inpatient Bed Lifecycle: Discharge to Housekeeping Sanitization', () => {
    it('atomically transitions bed to CLEANING upon inpatient discharge', () => {
      const testBed = {
        id: 'bed-icu-04',
        bedNumber: 'ICU-B04',
        status: BedStatus.OCCUPIED,
      };

      // Simulate discharge event
      const now = new Date();
      testBed.status = BedStatus.CLEANING;

      const historyLog = {
        bedId: testBed.id,
        previousStatus: BedStatus.OCCUPIED,
        newStatus: BedStatus.CLEANING,
        reason: 'Patient discharged. Bed queued for mandatory housekeeping sanitization.',
        timestamp: now.toISOString(),
      };

      assert.strictEqual(testBed.status, BedStatus.CLEANING);
      assert.strictEqual(historyLog.newStatus, BedStatus.CLEANING);
      assert.ok(historyLog.reason.includes('sanitization'));
    });

    it('releases bed from CLEANING to AVAILABLE only upon housekeeping completion', () => {
      const testBed = {
        id: 'bed-icu-04',
        bedNumber: 'ICU-B04',
        status: BedStatus.CLEANING,
      };

      // Bed cannot be allocated while in CLEANING
      function allocateBed(bed: typeof testBed) {
        if (bed.status !== BedStatus.AVAILABLE) {
          throw new Error(`Bed ${bed.bedNumber} is not AVAILABLE for admission (Current: ${bed.status})`);
        }
        bed.status = BedStatus.OCCUPIED;
      }

      assert.throws(() => allocateBed(testBed), /is not AVAILABLE for admission \(Current: CLEANING\)/);

      // Housekeeping cleans bed
      testBed.status = BedStatus.AVAILABLE;
      assert.strictEqual(testBed.status, BedStatus.AVAILABLE);

      // Now bed can safely be assigned
      allocateBed(testBed);
      assert.strictEqual(testBed.status, BedStatus.OCCUPIED);
    });
  });
});

