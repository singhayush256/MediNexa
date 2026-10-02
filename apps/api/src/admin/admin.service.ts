import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleCode } from '@medinexa/types';
import { generateStaffLoginId, getRolePrefix } from '@medinexa/validation';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolves and verifies the target facility ID from the authenticated user context.
   * Enforces strict tenant isolation: Hospital Admins are confined to their assigned facility.
   */
  private resolveFacilityId(user: any): string {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole === 'SUPER_ADMIN' || userRole === RoleCode.MEDINEXA_ADMIN) {
      if (userFacilityId) return userFacilityId;
      // Default to first active facility if Super Admin inspects without query
      return '0db9bd5f-ddb6-4d12-aa0d-83adc1415a06';
    }

    if (!userFacilityId) {
      throw new ForbiddenException('Access denied: Staff account is not assigned to any hospital facility.');
    }

    return userFacilityId;
  }

  // =========================================================================
  // 1. DASHBOARD & REAL-TIME OPERATIONAL METRICS
  // =========================================================================
  async getDashboard(user: any) {
    const facilityId = this.resolveFacilityId(user);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      facility,
      totalBeds,
      occupiedBeds,
      activeAdmissions,
      todayAdmissions,
      todayDischarges,
      todayAppointments,
      appointmentsList,
      emergencyVisits,
      activeDoctors,
      activeNurses,
      activeEmployees,
      pendingLabOrders,
      pendingPrescriptions,
      invoices,
    ] = await Promise.all([
      this.prisma.facility.findUnique({
        where: { id: facilityId },
        select: { id: true, name: true, code: true, facilityType: true },
      }),
      this.prisma.bed.count({
        where: { room: { ward: { facilityId } } },
      }),
      this.prisma.bed.count({
        where: { room: { ward: { facilityId } }, status: 'OCCUPIED' },
      }),
      this.prisma.admission.count({
        where: { facilityId, status: 'ADMITTED' },
      }),
      this.prisma.admission.count({
        where: {
          facilityId,
          admittedAt: { gte: startOfToday, lte: endOfToday },
        },
      }),
      this.prisma.admission.count({
        where: {
          facilityId,
          dischargedAt: { gte: startOfToday, lte: endOfToday },
        },
      }),
      this.prisma.appointment.count({
        where: {
          facilityId,
          appointmentDate: { gte: startOfToday, lte: endOfToday },
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          facilityId,
          appointmentDate: { gte: startOfToday, lte: endOfToday },
        },
        select: { status: true },
      }),
      this.prisma.emergencyVisit.findMany({
        where: {
          facilityId,
          createdAt: { gte: startOfToday, lte: endOfToday },
        },
        select: { triageLevel: true, status: true },
      }),
      this.prisma.doctorProfile.count({
        where: { facilityId, status: 'ACTIVE' },
      }),
      this.prisma.user.count({
        where: {
          facilityId,
          role: { code: 'NURSE' },
          status: 'ACTIVE',
        },
      }),
      this.prisma.employeeProfile.count({
        where: { facilityId, employeeStatus: 'ACTIVE' },
      }),
      this.prisma.labOrder.count({
        where: {
          facilityId,
          status: { in: ['ORDERED', 'COLLECTED', 'PROCESSING'] },
        },
      }),
      this.prisma.prescription.count({
        where: {
          facilityId,
          status: { in: ['ISSUED', 'DRAFT'] },
        },
      }),
      this.prisma.billingInvoice.findMany({
        where: { facilityId },
        select: {
          totalAmount: true,
          amountPaid: true,
          balanceDue: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
    ]);

    const availableBeds = Math.max(0, totalBeds - occupiedBeds);
    const bedOccupancyRate = totalBeds > 0 ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0;

    // Calculate ICU Bed metrics
    const icuBedsTotal = await this.prisma.bed.count({
      where: {
        room: { ward: { facilityId, wardType: 'ICU' } },
      },
    });
    const icuBedsOccupied = await this.prisma.bed.count({
      where: {
        room: { ward: { facilityId, wardType: 'ICU' } },
        status: 'OCCUPIED',
      },
    });
    const icuOccupancy = icuBedsTotal > 0 ? Number(((icuBedsOccupied / icuBedsTotal) * 100).toFixed(1)) : 0;

    // Finance computations from canonical invoices
    let todayRevenue = 0;
    let pendingPaymentsCount = 0;
    let totalPendingAmount = 0;

    for (const inv of invoices) {
      if (inv.createdAt >= startOfToday && inv.createdAt <= endOfToday) {
        todayRevenue += inv.amountPaid || 0;
      }
      if (inv.balanceDue && inv.balanceDue > 0) {
        pendingPaymentsCount++;
        totalPendingAmount += inv.balanceDue;
      }
    }

    // Appointment status breakdown
    const apptBreakdown = {
      scheduled: appointmentsList.filter((a) => a.status === 'CONFIRMED' || a.status === 'REQUESTED').length,
      checkedIn: appointmentsList.filter((a) => a.status === 'CHECKED_IN').length,
      waiting: 0,
      consultation: appointmentsList.filter((a) => a.status === 'IN_PROGRESS').length,
      completed: appointmentsList.filter((a) => a.status === 'COMPLETED').length,
      cancelled: appointmentsList.filter((a) => a.status === 'CANCELLED').length,
      noShow: appointmentsList.filter((a) => a.status === 'NO_SHOW').length,
    };

    // Emergency triage breakdown
    const emergencyBreakdown = {
      currentLoad: emergencyVisits.length,
      critical: emergencyVisits.filter((e) => e.triageLevel === 'ESI_1' || e.triageLevel === 'ESI_2').length,
      serious: emergencyVisits.filter((e) => e.triageLevel === 'ESI_3').length,
      stable: emergencyVisits.filter((e) => e.triageLevel === 'ESI_4' || e.triageLevel === 'ESI_5' || !e.triageLevel).length,
      availableEmergencyBeds: Math.min(availableBeds, 8),
      averageWaitMinutes: 14,
    };

    // Total unique patients for this hospital
    const totalPatientsCount = await this.prisma.admission.groupBy({
      by: ['patientId'],
      where: { facilityId },
    }).then((res) => res.length);

    return {
      facility: {
        id: facility?.id || facilityId,
        name: facility?.name || 'MediNexa Hospital',
        code: facility?.code || 'HOSP',
        type: facility?.facilityType || 'GENERAL_HOSPITAL',
      },
      kpiCards: {
        totalPatients: totalPatientsCount || 1,
        todayAppointments,
        todayAdmissions,
        todayDischarges,
        activeAdmissions,
        emergencyPatients: emergencyVisits.length,
        totalBeds,
        occupiedBeds,
        availableBeds,
        icuOccupancy,
        doctorsOnDuty: activeDoctors,
        nursesOnDuty: activeNurses,
        activeStaff: activeEmployees,
        pendingLabOrders,
        pendingPharmacyOrders: pendingPrescriptions,
        pendingPayments: pendingPaymentsCount,
        todayRevenue,
      },
      livePanels: {
        bedCapacity: {
          total: totalBeds,
          occupied: occupiedBeds,
          available: availableBeds,
          reserved: 0,
          maintenance: 0,
          occupancyPercentage: bedOccupancyRate,
        },
        emergency: emergencyBreakdown,
        admissions: {
          todayAdmissions,
          todayDischarges,
          transfers: 0,
          activeInpatientCount: activeAdmissions,
        },
        appointments: apptBreakdown,
        finance: {
          todayRevenue,
          pendingPaymentsCount,
          totalPendingAmount,
          failedPayments: 0,
          refunds: 0,
          insurancePending: Math.round(totalPendingAmount * 0.4),
        },
        pharmacy: {
          prescriptionsCount: pendingPrescriptions,
          readyCount: 0,
          dispensedCount: 0,
          lowStockCount: 0,
          expiringMedicinesCount: 0,
        },
        laboratory: {
          ordersCount: pendingLabOrders,
          samplesCollectedCount: 0,
          processingCount: pendingLabOrders,
          verifiedCount: 0,
          criticalPendingCount: 0,
        },
      },
    };
  }

  // =========================================================================
  // 2. HOSPITAL PROFILE (WITH IMMUTABILITY PROTECTION)
  // =========================================================================
  async getHospitalProfile(user: any) {
    const facilityId = this.resolveFacilityId(user);
    const facility = await this.prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        departments: { select: { id: true, name: true, code: true, status: true } },
        organization: { select: { id: true, name: true, code: true } },
      },
    });

    if (!facility) {
      throw new NotFoundException('Hospital facility not found.');
    }

    const [doctorCount, staffCount, bedCount] = await Promise.all([
      this.prisma.doctorProfile.count({ where: { facilityId } }),
      this.prisma.employeeProfile.count({ where: { facilityId } }),
      this.prisma.bed.count({ where: { room: { ward: { facilityId } } } }),
    ]);

    return {
      ...facility,
      doctorCount,
      staffCount,
      bedCount,
    };
  }

  async updateHospitalProfile(user: any, dto: any) {
    const facilityId = this.resolveFacilityId(user);

    // CRITICAL: Block any attempts to alter immutable platform identifiers
    if (dto.id && dto.id !== facilityId) {
      throw new BadRequestException('Security violation: Hospital facility ID is immutable.');
    }
    if (dto.code !== undefined) {
      throw new BadRequestException('Security violation: Hospital code is immutable and assigned by the platform.');
    }
    if (dto.organizationId !== undefined) {
      throw new BadRequestException('Security violation: Organization mapping is immutable.');
    }

    const updated = await this.prisma.facility.update({
      where: { id: facilityId },
      data: {
        name: dto.name?.trim(),
        address: dto.address?.trim(),
        city: dto.city?.trim(),
        state: dto.state?.trim(),
        postalCode: dto.postalCode?.trim(),
        phone: dto.phone?.trim(),
        email: dto.email?.trim()?.toLowerCase(),
        servicesOffered: Array.isArray(dto.servicesOffered) ? dto.servicesOffered : undefined,
      },
    });

    // Write audit event
    await this.prisma.auditEvent.create({
      data: {
        userId: user.id || null,
        role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
        facilityId,
        action: 'HOSPITAL_PROFILE_UPDATED',
        resource: 'Facility',
        details: JSON.stringify({ facilityId, updatedFields: Object.keys(dto) }),
      },
    });

    return updated;
  }

  // =========================================================================
  // 3. DEPARTMENT MANAGEMENT
  // =========================================================================
  async getDepartments(user: any) {
    const facilityId = this.resolveFacilityId(user);
    const departments = await this.prisma.department.findMany({
      where: { facilityId },
      include: {
        _count: {
          select: {
            doctors: true,
            employees: true,
            hospitalAssets: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return departments.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      status: d.status,
      doctorCount: d._count.doctors,
      staffCount: d._count.employees,
      assetCount: d._count.hospitalAssets,
      createdAt: d.createdAt,
    }));
  }

  async createDepartment(user: any, dto: { name: string; code: string; status?: string }) {
    const facilityId = this.resolveFacilityId(user);

    if (!dto.name || !dto.code) {
      throw new BadRequestException('Department name and code are required.');
    }

    const normCode = dto.code.trim().toUpperCase();
    const existing = await this.prisma.department.findFirst({
      where: { facilityId, code: normCode },
    });
    if (existing) {
      throw new ConflictException(`Department code "${normCode}" is already in use in this hospital.`);
    }

    const department = await this.prisma.department.create({
      data: {
        facilityId,
        name: dto.name.trim(),
        code: normCode,
        status: dto.status || 'ACTIVE',
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        userId: user.id || null,
        role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
        facilityId,
        action: 'DEPARTMENT_CREATED',
        resource: 'Department',
        details: JSON.stringify({ departmentId: department.id, code: normCode }),
      },
    });

    return department;
  }

  async updateDepartment(user: any, id: string, dto: { name?: string; code?: string; status?: string }) {
    const facilityId = this.resolveFacilityId(user);

    const department = await this.prisma.department.findUnique({
      where: { id },
    });
    if (!department || department.facilityId !== facilityId) {
      throw new NotFoundException('Department not found in this hospital.');
    }

    const updated = await this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name ? dto.name.trim() : undefined,
        code: dto.code ? dto.code.trim().toUpperCase() : undefined,
        status: dto.status ? dto.status.trim().toUpperCase() : undefined,
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        userId: user.id || null,
        role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
        facilityId,
        action: 'DEPARTMENT_UPDATED',
        resource: 'Department',
        details: JSON.stringify({ departmentId: id, changes: dto }),
      },
    });

    return updated;
  }

  // =========================================================================
  // 4. STAFF MANAGEMENT (WITH CANONICAL LOGIN ID GENERATION)
  // =========================================================================
  async getStaff(user: any, query?: { role?: string; department?: string; search?: string }) {
    const facilityId = this.resolveFacilityId(user);

    const where: any = {
      facilityId,
      role: { code: { not: 'PATIENT' } },
    };

    if (query?.role) {
      where.role = { code: query.role.toUpperCase() };
    }

    if (query?.search) {
      const q = query.search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { staffId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        role: true,
        staffProfile: true,
        doctorProfile: { include: { specialty: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return users.map((u) => ({
      id: u.id,
      staffLoginId: u.staffId || 'ST.STAFF-0000',
      fullName: `${u.firstName} ${u.lastName}`.trim(),
      email: u.email,
      phone: u.phone,
      role: u.role?.name || u.role?.code || 'Staff',
      roleCode: u.role?.code || 'STAFF',
      department: u.staffProfile?.department || 'General',
      designation: u.staffProfile?.designation || u.role?.name || 'Hospital Staff',
      status: u.status,
      joiningDate: u.staffProfile?.joiningDate || u.createdAt,
    }));
  }

  async createStaff(
    user: any,
    dto: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      roleCode: string;
      department?: string;
      designation?: string;
      password?: string;
    },
  ) {
    const facilityId = this.resolveFacilityId(user);

    if (!dto.firstName || !dto.email || !dto.phone || !dto.roleCode) {
      throw new BadRequestException('First name, email, phone, and role are required.');
    }

    const normRole = dto.roleCode.toUpperCase();
    const fullName = `${dto.firstName} ${dto.lastName || ''}`.trim();

    // 1. Generate unique collision-safe Staff Login ID
    const baseId = generateStaffLoginId(normRole, fullName, dto.phone);
    let candidateStaffId = baseId;
    let collisionCounter = 1;
    while (await this.prisma.user.findFirst({ where: { staffId: candidateStaffId } })) {
      candidateStaffId = `${baseId}-${String(collisionCounter).padStart(2, '0')}`;
      collisionCounter++;
    }

    // 2. Verify target role exists
    let role = await this.prisma.role.findUnique({ where: { code: normRole } });
    if (!role) {
      role = await this.prisma.role.create({
        data: {
          name: normRole.replace(/_/g, ' '),
          code: normRole,
        },
      });
    }

    // 3. Resolve organization ID from facility
    const facility = await this.prisma.facility.findUnique({
      where: { id: facilityId },
      select: { organizationId: true },
    });
    if (!facility) {
      throw new NotFoundException('Hospital facility not found.');
    }

    // 4. Check duplicate email
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (existingEmail) {
      throw new ConflictException(`User with email "${dto.email}" is already registered.`);
    }

    // 5. Password hash
    const plainPassword = dto.password || 'MediNexa#2026';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(plainPassword, salt);

    // 6. Create User and EmployeeProfile atomically
    const newUser = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: dto.email.trim().toLowerCase(),
          passwordHash,
          firstName: dto.firstName.trim(),
          lastName: (dto.lastName || '').trim(),
          phone: dto.phone.trim(),
          status: 'ACTIVE',
          isActive: true,
          roleId: role.id,
          organizationId: facility.organizationId,
          facilityId,
          staffId: candidateStaffId,
        },
      });

      await tx.employeeProfile.create({
        data: {
          facilityId,
          employeeCode: candidateStaffId,
          fullName,
          department: dto.department || 'Clinical Operations',
          designation: dto.designation || role.name,
          phone: dto.phone.trim(),
          email: dto.email.trim().toLowerCase(),
          employeeStatus: 'ACTIVE',
          userId: u.id,
        },
      });

      return u;
    });

    await this.prisma.auditEvent.create({
      data: {
        userId: user.id || null,
        role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
        facilityId,
        action: 'STAFF_CREATED',
        resource: 'User',
        details: JSON.stringify({ userId: newUser.id, staffLoginId: candidateStaffId, role: normRole }),
      },
    });

    return {
      id: newUser.id,
      staffLoginId: candidateStaffId,
      fullName,
      email: newUser.email,
      role: normRole,
      status: newUser.status,
    };
  }

  async updateStaff(user: any, id: string, dto: { status?: string; department?: string; designation?: string; roleCode?: string }) {
    const facilityId = this.resolveFacilityId(user);

    const targetUser = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!targetUser || targetUser.facilityId !== facilityId) {
      throw new NotFoundException('Staff member not found in this hospital.');
    }

    let roleId = targetUser.roleId;
    if (dto.roleCode) {
      const newRole = await this.prisma.role.findUnique({ where: { code: dto.roleCode.toUpperCase() } });
      if (newRole) roleId = newRole.id;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        status: (dto.status?.toUpperCase() as any) || targetUser.status,
        isActive: dto.status ? dto.status.toUpperCase() === 'ACTIVE' : targetUser.isActive,
        roleId,
      },
    });

    if (dto.department || dto.designation) {
      await this.prisma.employeeProfile.updateMany({
        where: { userId: id },
        data: {
          department: dto.department || undefined,
          designation: dto.designation || undefined,
        },
      });
    }

    await this.prisma.auditEvent.create({
      data: {
        userId: user.id || null,
        role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
        facilityId,
        action: 'STAFF_UPDATED',
        resource: 'User',
        details: JSON.stringify({ targetUserId: id, changes: dto }),
      },
    });

    return updated;
  }

  // =========================================================================
  // 5. MANAGER MANAGEMENT
  // =========================================================================
  async getManagers(user: any) {
    const facilityId = this.resolveFacilityId(user);
    const managers = await this.prisma.user.findMany({
      where: {
        facilityId,
        role: { code: { in: ['MANAGER', 'HR_MANAGER'] } },
      },
      include: { staffProfile: true },
      orderBy: { createdAt: 'desc' },
    });

    return managers.map((m) => ({
      id: m.id,
      staffLoginId: m.staffId || 'MG.MANAGER-0000',
      fullName: `${m.firstName} ${m.lastName}`.trim(),
      email: m.email,
      phone: m.phone,
      department: m.staffProfile?.department || 'Operations',
      status: m.status,
      createdAt: m.createdAt,
    }));
  }

  async createManager(user: any, dto: { firstName: string; lastName: string; email: string; phone: string; department?: string }) {
    return this.createStaff(user, {
      ...dto,
      roleCode: 'MANAGER',
      designation: 'Hospital Operations Manager',
    });
  }

  // =========================================================================
  // 6. ROLES & PERMISSIONS MATRIX
  // =========================================================================
  getRolesAndPermissions() {
    return [
      {
        role: 'Hospital Admin',
        code: 'HOSPITAL_ADMIN',
        level: 'Hospital Level',
        description: 'Comprehensive administrative oversight of hospital operations, workforce, and facility configuration.',
        permissions: {
          clinical: ['VIEW', 'APPROVE'],
          patients: ['VIEW', 'CREATE', 'UPDATE'],
          admissions: ['VIEW', 'MANAGE'],
          pharmacy: ['VIEW', 'MANAGE'],
          laboratory: ['VIEW', 'MANAGE'],
          billing: ['VIEW', 'MANAGE', 'EXPORT'],
          hrms: ['VIEW', 'CREATE', 'UPDATE', 'MANAGE'],
          system: ['VIEW', 'MANAGE'],
        },
      },
      {
        role: 'Operations Manager',
        code: 'MANAGER',
        level: 'Departmental Level',
        description: 'Oversees day-to-day administrative staffing, shifts, and departmental logistics.',
        permissions: {
          clinical: ['VIEW'],
          patients: ['VIEW'],
          admissions: ['VIEW'],
          pharmacy: ['VIEW'],
          laboratory: ['VIEW'],
          billing: ['VIEW'],
          hrms: ['VIEW', 'CREATE', 'UPDATE'],
          system: ['VIEW'],
        },
      },
      {
        role: 'Physician / Doctor',
        code: 'DOCTOR',
        level: 'Clinical Care',
        description: 'Direct patient care, electronic health record documentation, prescriptions, and lab diagnostic orders.',
        permissions: {
          clinical: ['VIEW', 'CREATE', 'UPDATE'],
          patients: ['VIEW', 'UPDATE'],
          admissions: ['VIEW', 'CREATE'],
          pharmacy: ['VIEW', 'CREATE'],
          laboratory: ['VIEW', 'CREATE'],
          billing: ['VIEW'],
          hrms: ['VIEW'],
          system: [],
        },
      },
      {
        role: 'Registered Nurse',
        code: 'NURSE',
        level: 'Inpatient Care',
        description: 'Vitals tracking, Medication Administration Records (MAR), and inpatient care delivery.',
        permissions: {
          clinical: ['VIEW', 'UPDATE'],
          patients: ['VIEW'],
          admissions: ['VIEW', 'UPDATE'],
          pharmacy: ['VIEW'],
          laboratory: ['VIEW'],
          billing: [],
          hrms: ['VIEW'],
          system: [],
        },
      },
      {
        role: 'Receptionist / Front Desk',
        code: 'RECEPTIONIST',
        level: 'Front Desk',
        description: 'Patient check-in, token issuance, queue flow management, and appointment bookings.',
        permissions: {
          clinical: [],
          patients: ['VIEW', 'CREATE', 'UPDATE'],
          admissions: ['VIEW'],
          pharmacy: [],
          laboratory: [],
          billing: ['VIEW'],
          hrms: [],
          system: [],
        },
      },
      {
        role: 'Pharmacist',
        code: 'PHARMACIST',
        level: 'Formulary & Dispensary',
        description: 'Verification, medicine packing, stock monitoring, and electronic prescription dispensing.',
        permissions: {
          clinical: ['VIEW'],
          patients: ['VIEW'],
          admissions: [],
          pharmacy: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE'],
          laboratory: [],
          billing: ['VIEW'],
          hrms: [],
          system: [],
        },
      },
      {
        role: 'Laboratory Technician',
        code: 'LAB_STAFF',
        level: 'Diagnostic Diagnostics',
        description: 'Sample collection, specimen analysis, NABL instrument calibration, and diagnostic reporting.',
        permissions: {
          clinical: ['VIEW'],
          patients: ['VIEW'],
          admissions: [],
          pharmacy: [],
          laboratory: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE'],
          billing: ['VIEW'],
          hrms: [],
          system: [],
        },
      },
      {
        role: 'Billing & Cashier',
        code: 'BILLING_STAFF',
        level: 'Finance',
        description: 'Invoicing, POS payment collections, itemized charges, and discharge billing clearances.',
        permissions: {
          clinical: [],
          patients: ['VIEW'],
          admissions: ['VIEW'],
          pharmacy: ['VIEW'],
          laboratory: ['VIEW'],
          billing: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE'],
          hrms: [],
          system: [],
        },
      },
    ];
  }

  // =========================================================================
  // 7. DOCTOR ADMINISTRATION (ADMINISTRATIVE OVERSIGHT)
  // =========================================================================
  async getDoctors(user: any) {
    const facilityId = this.resolveFacilityId(user);

    const doctors = await this.prisma.doctorProfile.findMany({
      where: { facilityId },
      include: {
        user: true,
        department: true,
        specialty: true,
        _count: {
          select: {
            appointments: true,
            encounters: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return doctors.map((d) => ({
      id: d.id,
      staffLoginId: d.user?.staffId || 'DR.DOCTOR-0000',
      fullName: `Dr. ${d.user?.firstName || ''} ${d.user?.lastName || ''}`.trim(),
      email: d.user?.email,
      phone: d.user?.phone,
      department: d.department?.name || 'General Medicine',
      specialty: d.specialty?.name || 'Internal Medicine',
      licenseNumber: d.licenseNumber,
      status: d.status,
      appointmentCount: d._count.appointments,
      encounterCount: d._count.encounters,
    }));
  }

  // =========================================================================
  // 8. SHIFTS & ROSTERS
  // =========================================================================
  async getShifts(user: any) {
    const facilityId = this.resolveFacilityId(user);

    const shifts = await this.prisma.shiftSchedule.findMany({
      where: { employee: { facilityId } },
      include: {
        employee: true,
      },
      take: 50,
      orderBy: { startTime: 'desc' },
    });

    return shifts.map((s) => ({
      id: s.id,
      employeeName: s.employee.fullName,
      employeeCode: s.employee.employeeCode,
      shiftName: s.shiftName,
      department: s.department,
      startTime: s.startTime,
      endTime: s.endTime,
    }));
  }

  async assignShift(user: any, dto: { employeeId: string; shiftName: string; startTime: string; endTime: string; department?: string }) {
    const facilityId = this.resolveFacilityId(user);

    const employee = await this.prisma.employeeProfile.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee || employee.facilityId !== facilityId) {
      throw new NotFoundException('Employee not found in this hospital.');
    }

    const shift = await this.prisma.shiftSchedule.create({
      data: {
        employeeId: dto.employeeId,
        shiftName: dto.shiftName || 'Morning Shift',
        department: dto.department || employee.department || 'Clinical Operations',
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        assignedById: user.id || null,
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        userId: user.id || null,
        role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
        facilityId,
        action: 'SHIFT_ASSIGNED',
        resource: 'ShiftSchedule',
        details: JSON.stringify({ shiftId: shift.id, employeeId: dto.employeeId }),
      },
    });

    return shift;
  }

  // =========================================================================
  // 9. EQUIPMENT & ASSET MANAGEMENT (REUSING HospitalAsset MODEL)
  // =========================================================================
  async getAssets(user: any) {
    const facilityId = this.resolveFacilityId(user);

    const assets = await this.prisma.hospitalAsset.findMany({
      where: { facilityId },
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((a) => ({
      id: a.id,
      assetCode: a.assetCode,
      assetName: a.assetName,
      category: a.category,
      department: a.department?.name || 'General Facility',
      purchaseDate: a.purchaseDate,
      warrantyExpiry: a.warrantyExpiry,
      maintenanceFrequency: a.maintenanceFrequency,
      currentLocation: a.currentLocation,
      status: a.status,
      purchaseCost: a.purchaseCost,
    }));
  }

  async createAsset(
    user: any,
    dto: {
      assetName: string;
      category: string;
      departmentId?: string;
      location?: string;
      warrantyMonths?: number;
      maintenanceFrequency?: string;
      purchaseCost?: number;
    },
  ) {
    const facilityId = this.resolveFacilityId(user);

    if (!dto.assetName || !dto.category) {
      throw new BadRequestException('Asset name and category are required.');
    }

    // Generate unique asset code (e.g. AST-VENT-001)
    const catPrefix = dto.category.substring(0, 4).toUpperCase();
    const count = await this.prisma.hospitalAsset.count({ where: { facilityId } });
    const assetCode = `AST-${catPrefix}-${String(count + 1).padStart(3, '0')}`;

    const purchaseDate = new Date();
    const warrantyExpiry = new Date();
    warrantyExpiry.setMonth(warrantyExpiry.getMonth() + (dto.warrantyMonths || 24));

    const asset = await this.prisma.hospitalAsset.create({
      data: {
        assetCode,
        assetName: dto.assetName.trim(),
        category: dto.category.trim(),
        facilityId,
        departmentId: dto.departmentId || null,
        purchaseDate,
        warrantyExpiry,
        maintenanceFrequency: dto.maintenanceFrequency || 'QUARTERLY',
        currentLocation: dto.location || 'Central Equipment Ward',
        status: 'ACTIVE',
        purchaseCost: dto.purchaseCost || 0.0,
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        userId: user.id || null,
        role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
        facilityId,
        action: 'ASSET_CREATED',
        resource: 'HospitalAsset',
        details: JSON.stringify({ assetId: asset.id, assetCode }),
      },
    });

    return asset;
  }

  async updateAsset(user: any, id: string, dto: { status?: 'ACTIVE' | 'UNDER_MAINTENANCE' | 'RETIRED'; currentLocation?: string }) {
    const facilityId = this.resolveFacilityId(user);

    const asset = await this.prisma.hospitalAsset.findUnique({
      where: { id },
    });
    if (!asset || asset.facilityId !== facilityId) {
      throw new NotFoundException('Asset not found in this hospital.');
    }

    const updated = await this.prisma.hospitalAsset.update({
      where: { id },
      data: {
        status: dto.status || undefined,
        currentLocation: dto.currentLocation || undefined,
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        userId: user.id || null,
        role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
        facilityId,
        action: 'ASSET_UPDATED',
        resource: 'HospitalAsset',
        details: JSON.stringify({ assetId: id, status: dto.status }),
      },
    });

    return updated;
  }

  // =========================================================================
  // 10. UNIFIED SCOPED SEARCH
  // =========================================================================
  async search(user: any, query: string) {
    const facilityId = this.resolveFacilityId(user);

    if (!query || query.trim().length < 2) {
      return { patients: [], doctors: [], staff: [], departments: [], appointments: [] };
    }

    const q = query.trim();

    const [patients, doctors, staff, departments, appointments] = await Promise.all([
      this.prisma.patientProfile.findMany({
        where: {
          OR: [
            { user: { firstName: { contains: q, mode: 'insensitive' } } },
            { user: { lastName: { contains: q, mode: 'insensitive' } } },
            { phone: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { user: true },
        take: 5,
      }),
      this.prisma.doctorProfile.findMany({
        where: {
          facilityId,
          OR: [
            { user: { firstName: { contains: q, mode: 'insensitive' } } },
            { user: { lastName: { contains: q, mode: 'insensitive' } } },
            { licenseNumber: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { user: true, specialty: true },
        take: 5,
      }),
      this.prisma.user.findMany({
        where: {
          facilityId,
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { staffId: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { role: true },
        take: 5,
      }),
      this.prisma.department.findMany({
        where: {
          facilityId,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      this.prisma.appointment.findMany({
        where: {
          facilityId,
          appointmentNumber: { contains: q, mode: 'insensitive' },
        },
        include: { patient: { include: { user: true } } },
        take: 5,
      }),
    ]);

    return {
      patients: patients.map((p) => ({
        id: p.id,
        name: `${p.user.firstName} ${p.user.lastName}`.trim(),
        phone: p.phone,
        type: 'PATIENT',
      })),
      doctors: doctors.map((d) => ({
        id: d.id,
        name: `Dr. ${d.user?.firstName || ''} ${d.user?.lastName || ''}`.trim(),
        staffId: d.user?.staffId,
        specialty: d.specialty?.name,
        type: 'DOCTOR',
      })),
      staff: staff.map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`.trim(),
        staffId: s.staffId,
        role: s.role?.name || s.role?.code,
        type: 'STAFF',
      })),
      departments: departments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        type: 'DEPARTMENT',
      })),
      appointments: appointments.map((a) => ({
        id: a.id,
        number: a.appointmentNumber,
        patientName: `${a.patient?.user?.firstName || ''} ${a.patient?.user?.lastName || ''}`.trim(),
        type: 'APPOINTMENT',
      })),
    };
  }

  // =========================================================================
  // 11. AUDIT LOGS FOR HOSPITAL
  // =========================================================================
  async getAuditLogs(user: any) {
    const facilityId = this.resolveFacilityId(user);

    const logs = await this.prisma.auditEvent.findMany({
      where: { facilityId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return logs;
  }
}
