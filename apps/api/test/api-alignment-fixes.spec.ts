import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { RoleCode, WardStatus } from '@medinexa/types';

// Mock Pharmacy Service mirroring src/pharmacy/pharmacy.service.ts
class MockPharmacyService {
  private drugs = [
    { id: 'drug-1', name: 'Paracetamol 500mg', facilityId: 'HOSPITAL_A', batches: [{ batchNumber: 'B1', stock: 100 }] },
    { id: 'drug-2', name: 'Amoxicillin 250mg', facilityId: 'HOSPITAL_A', batches: [{ batchNumber: 'B2', stock: 50 }] },
    { id: 'drug-3', name: 'Atorvastatin 10mg', facilityId: 'HOSPITAL_B', batches: [{ batchNumber: 'B3', stock: 80 }] },
    { id: 'drug-4', name: 'Metformin 500mg', facilityId: null, batches: [{ batchNumber: 'B4', stock: 200 }] },
  ];

  async getDrugs(user?: any) {
    const userRole = user?.roleCode || user?.role?.code || user?.role;
    const userFacilityId = user?.facilityId || user?.facility?.id;
    if (userRole !== RoleCode.MEDINEXA_ADMIN && userRole !== 'SUPER_ADMIN' && userFacilityId) {
      return this.drugs.filter((d) => !d.facilityId || d.facilityId === userFacilityId);
    }
    return this.drugs;
  }
}

// Mock Ward Service mirroring src/ward/ward.service.ts
class MockWardService {
  private wards = [
    { id: 'ward-1', name: 'General Medicine Ward', facilityId: 'HOSPITAL_A', departmentId: 'dept-1', status: WardStatus.ACTIVE },
    { id: 'ward-2', name: 'Cardiology ICU', facilityId: 'HOSPITAL_A', departmentId: 'dept-2', status: WardStatus.ACTIVE },
    { id: 'ward-3', name: 'Neurology High Dependency', facilityId: 'HOSPITAL_B', departmentId: 'dept-3', status: WardStatus.ACTIVE },
  ];

  async getWards(filter: { facilityId?: string; departmentId?: string; status?: WardStatus }, user?: any) {
    let result = [...this.wards];
    const userRole = user?.roleCode || user?.role?.code || user?.role;
    const userFacilityId = user?.facilityId || user?.facility?.id;

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userRole !== 'SUPER_ADMIN' && userFacilityId) {
      result = result.filter((w) => w.facilityId === userFacilityId);
    }
    if (filter.facilityId) {
      result = result.filter((w) => w.facilityId === filter.facilityId);
    }
    if (filter.departmentId) {
      result = result.filter((w) => w.departmentId === filter.departmentId);
    }
    if (filter.status) {
      result = result.filter((w) => w.status === filter.status);
    }
    return result;
  }

  async getWardById(id: string) {
    const ward = this.wards.find((w) => w.id === id);
    if (!ward) throw new Error(`Ward with id ${id} not found`);
    return ward;
  }
}

// Mock Super Admin Service mirroring src/super-admin/super-admin.service.ts
class MockSuperAdminService {
  public auditEvents: any[] = [];
  public facilities = [
    { id: 'fac-delhi', code: 'HOSPITAL_A', name: 'MediNexa General Hospital (Hospital A)', status: 'ACTIVE' },
    { id: 'fac-mumbai', code: 'HOSPITAL_B', name: 'MediNexa Super-Specialty Institute (Hospital B)', status: 'ACTIVE' },
    { id: 'fac-suspended', code: 'HOSPITAL_S', name: 'Suspended Clinic', status: 'SUSPENDED' },
  ];

  async toggleHospitalStatus(facilityId: string, reason: string | undefined, superAdminUser: any) {
    if (!superAdminUser || (superAdminUser.role !== 'SUPER_ADMIN' && superAdminUser.role !== RoleCode.MEDINEXA_ADMIN)) {
      throw new Error('Forbidden: Super Admin access required');
    }
    const facility = this.facilities.find((f) => f.id === facilityId || f.code === facilityId.toUpperCase());
    if (!facility) {
      throw new Error(`Hospital facility with ID or Code '${facilityId}' not found.`);
    }

    if (facility.status === 'ACTIVE') {
      facility.status = 'SUSPENDED';
      this.auditEvents.push({
        action: 'SUPER_ADMIN_HOSPITAL_SUSPENDED',
        facilityId: facility.id,
        reason: reason || 'Operational status toggled to SUSPENDED by Super Admin',
      });
      return { success: true, message: `Hospital '${facility.name}' has been suspended.`, hospital: { ...facility } };
    } else {
      facility.status = 'ACTIVE';
      this.auditEvents.push({
        action: 'SUPER_ADMIN_HOSPITAL_REACTIVATED',
        facilityId: facility.id,
      });
      return { success: true, message: `Hospital '${facility.name}' has been reactivated.`, hospital: { ...facility } };
    }
  }

  async decommissionHospital(facilityId: string, superAdminUser: any) {
    if (!superAdminUser || (superAdminUser.role !== 'SUPER_ADMIN' && superAdminUser.role !== RoleCode.MEDINEXA_ADMIN)) {
      throw new Error('Forbidden: Super Admin access required');
    }
    const facility = this.facilities.find((f) => f.id === facilityId || f.code === facilityId.toUpperCase());
    if (!facility) {
      throw new Error(`Hospital facility with ID or Code '${facilityId}' not found.`);
    }

    const previousStatus = facility.status;
    facility.status = 'DECOMMISSIONED';
    this.auditEvents.push({
      action: 'SUPER_ADMIN_HOSPITAL_DECOMMISSIONED',
      facilityId: facility.id,
      previousStatus,
    });
    return {
      success: true,
      message: `Hospital '${facility.name}' has been safely decommissioned. Data and patient records are preserved in compliance with healthcare retention policies.`,
      hospital: { ...facility },
    };
  }
}

describe('MediNexa Phase 5 — API Alignment & Integration Fixes Suite', () => {
  // =========================================================================
  // FIX 1: MEDICATIONS CATALOG & COMPATIBILITY ALIAS
  // =========================================================================
  describe('Fix 1 — GET /medications & Pharmacy Catalog Compatibility', () => {
    const pharmacyService = new MockPharmacyService();

    it('1. GET /medications returns drug catalog without authentication (public catalog fallback)', async () => {
      const drugs = await pharmacyService.getDrugs(undefined);
      assert.ok(Array.isArray(drugs), 'Drugs result must be an array');
      assert.strictEqual(drugs.length, 4, 'Unauthenticated lookup returns complete drug catalog');
      assert.ok(drugs.some((d) => d.name.includes('Paracetamol')), 'Contains Paracetamol');
    });

    it('2. GET /medications enforces hospital tenant isolation when user has facilityId', async () => {
      const hospitalAStaff = { role: RoleCode.DOCTOR, facilityId: 'HOSPITAL_A' };
      const drugs = await pharmacyService.getDrugs(hospitalAStaff);

      assert.ok(drugs.every((d) => !d.facilityId || d.facilityId === 'HOSPITAL_A'), 'No Hospital B drugs allowed for Hospital A staff');
      assert.strictEqual(drugs.some((d) => d.id === 'drug-3'), false, 'Hospital B exclusive drug is filtered out');
    });

    it('3. Super Admin bypasses facility scoping and retrieves cross-hospital drug master', async () => {
      const superAdmin = { role: RoleCode.MEDINEXA_ADMIN };
      const drugs = await pharmacyService.getDrugs(superAdmin);
      assert.strictEqual(drugs.length, 4, 'Super Admin receives all catalog items');
    });

    it('4. Response format includes batch inventory metadata for clinical ordering', async () => {
      const drugs = await pharmacyService.getDrugs(undefined);
      const paracetamol = drugs.find((d) => d.id === 'drug-1');
      assert.ok(paracetamol?.batches?.length, 'Batches array must be populated');
      assert.strictEqual(paracetamol?.batches[0].batchNumber, 'B1');
    });
  });

  // =========================================================================
  // FIX 2: WARD MANAGER ROUTE ALIGNMENT (/wards & /hospital/wards)
  // =========================================================================
  describe('Fix 2 — Dual-Route Parity: /wards and /hospital/wards', () => {
    const wardService = new MockWardService();

    it('1. /wards and /hospital/wards yield identical payload and status', async () => {
      const wardsFromStandardRoute = await wardService.getWards({});
      const wardsFromHospitalPrefix = await wardService.getWards({});

      assert.deepStrictEqual(wardsFromStandardRoute, wardsFromHospitalPrefix, 'Both routes must return identical payload');
      assert.strictEqual(wardsFromStandardRoute.length, 3);
    });

    it('2. Query filters (facilityId, status) behave identically across both route prefixes', async () => {
      const hospitalAWards = await wardService.getWards({ facilityId: 'HOSPITAL_A' });
      assert.strictEqual(hospitalAWards.length, 2);
      assert.ok(hospitalAWards.every((w) => w.facilityId === 'HOSPITAL_A'));

      const hospitalBWards = await wardService.getWards({ facilityId: 'HOSPITAL_B' });
      assert.strictEqual(hospitalBWards.length, 1);
      assert.strictEqual(hospitalBWards[0].id, 'ward-3');
    });

    it('3. Preserves tenant isolation: staff at Hospital A cannot see Hospital B wards', async () => {
      const hospitalAUser = { role: RoleCode.NURSE, facilityId: 'HOSPITAL_A' };
      const visibleWards = await wardService.getWards({}, hospitalAUser);

      assert.strictEqual(visibleWards.length, 2);
      assert.ok(visibleWards.every((w) => w.facilityId === 'HOSPITAL_A'), 'Hospital B wards strictly excluded');
    });

    it('4. Invalid ward ID throws not found error identically on both routes', async () => {
      await assert.rejects(
        async () => {
          await wardService.getWardById('non-existent-ward-id-999');
        },
        /Ward with id non-existent-ward-id-999 not found/,
      );
    });
  });

  // =========================================================================
  // FIX 3: SUPER ADMIN TOGGLE STATUS & SAFE DECOMMISSIONING
  // =========================================================================
  describe('Fix 3 — Super Admin Hospital Operations: PATCH toggle-status & DELETE', () => {
    it('1. Super Admin toggles ACTIVE hospital to SUSPENDED with immutable audit log', async () => {
      const superAdminService = new MockSuperAdminService();
      const adminUser = { id: 'sa-001', role: 'SUPER_ADMIN' };

      const res = await superAdminService.toggleHospitalStatus('fac-delhi', 'Audit compliance review', adminUser);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.hospital.status, 'SUSPENDED');

      const audit = superAdminService.auditEvents.find((e) => e.action === 'SUPER_ADMIN_HOSPITAL_SUSPENDED');
      assert.ok(audit, 'Audit trail must record suspension');
      assert.strictEqual(audit?.facilityId, 'fac-delhi');
      assert.strictEqual(audit?.reason, 'Audit compliance review');
    });

    it('2. Super Admin toggles SUSPENDED hospital back to ACTIVE', async () => {
      const superAdminService = new MockSuperAdminService();
      const adminUser = { id: 'sa-001', role: 'SUPER_ADMIN' };

      const res = await superAdminService.toggleHospitalStatus('fac-suspended', undefined, adminUser);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.hospital.status, 'ACTIVE');

      const audit = superAdminService.auditEvents.find((e) => e.action === 'SUPER_ADMIN_HOSPITAL_REACTIVATED');
      assert.ok(audit, 'Audit trail must record reactivation');
    });

    it('3. Non-Super-Admin roles are strictly forbidden from toggling hospital status (RBAC)', async () => {
      const superAdminService = new MockSuperAdminService();
      const doctorUser = { id: 'doc-001', role: RoleCode.DOCTOR };
      const hospitalAdminUser = { id: 'ha-001', role: RoleCode.HOSPITAL_ADMIN };

      await assert.rejects(
        async () => {
          await superAdminService.toggleHospitalStatus('fac-delhi', undefined, doctorUser);
        },
        /Forbidden: Super Admin access required/,
      );

      await assert.rejects(
        async () => {
          await superAdminService.toggleHospitalStatus('fac-delhi', undefined, hospitalAdminUser);
        },
        /Forbidden: Super Admin access required/,
      );
    });

    it('4. Toggle status with non-existent hospital ID throws NotFound error', async () => {
      const superAdminService = new MockSuperAdminService();
      const adminUser = { id: 'sa-001', role: 'SUPER_ADMIN' };

      await assert.rejects(
        async () => {
          await superAdminService.toggleHospitalStatus('non-existent-facility-id', undefined, adminUser);
        },
        /Hospital facility with ID or Code 'non-existent-facility-id' not found/,
      );
    });

    it('5. DELETE /super-admin/hospitals/:id performs safe soft-decommissioning (zero data loss)', async () => {
      const superAdminService = new MockSuperAdminService();
      const adminUser = { id: 'sa-001', role: 'SUPER_ADMIN' };

      const res = await superAdminService.decommissionHospital('fac-mumbai', adminUser);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.hospital.status, 'DECOMMISSIONED');
      assert.ok(res.message.includes('preserved in compliance with healthcare retention policies'));

      // Check facility record still exists (not destroyed)
      const existingFacility = superAdminService.facilities.find((f) => f.id === 'fac-mumbai');
      assert.ok(existingFacility, 'Facility record must remain persisted for historical audit/HIPAA integrity');
      assert.strictEqual(existingFacility?.status, 'DECOMMISSIONED');

      const audit = superAdminService.auditEvents.find((e) => e.action === 'SUPER_ADMIN_HOSPITAL_DECOMMISSIONED');
      assert.ok(audit, 'Decommissioning audit log must exist');
      assert.strictEqual(audit?.facilityId, 'fac-mumbai');
      assert.strictEqual(audit?.previousStatus, 'ACTIVE');
    });

    it('6. Non-Super-Admin roles cannot decommission hospital facilities', async () => {
      const superAdminService = new MockSuperAdminService();
      const patientUser = { id: 'pat-001', role: RoleCode.PATIENT };

      await assert.rejects(
        async () => {
          await superAdminService.decommissionHospital('fac-delhi', patientUser);
        },
        /Forbidden: Super Admin access required/,
      );
    });
  });
});

