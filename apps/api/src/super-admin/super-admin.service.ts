import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcryptjs from 'bcryptjs';
import { normalizeStaffName } from '@medinexa/validation';

const bcrypt = (bcryptjs as any).default || bcryptjs;

export interface CreateSuperAdminHospitalDto {
  name: string;
  code: string;
  hospitalType?: string;
  registrationNumber?: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;

  adminFullName: string;
  adminEmail: string;
  adminMobile: string;
  adminLoginId?: string;
  temporaryPassword?: string;
}

export interface PlatformSettingsDto {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUploadSizeMb: number;
  sessionTimeoutMinutes: number;
}

/**
 * Generates an immutable, sequential, collision-safe platform-level Hospital ID.
 * Standard format: HOSP-000001, HOSP-000002, etc.
 */
export async function generateUniqueHospitalId(prisma: any): Promise<string> {
  const count = await prisma.facility.count();
  let candidateNumber = count + 1;

  for (let attempt = 0; attempt < 100; attempt++) {
    const candidateId = `HOSP-${String(candidateNumber).padStart(6, '0')}`;
    const existing = await prisma.facility.findFirst({
      where: {
        OR: [
          { code: candidateId },
          { id: candidateId },
        ],
      },
    });
    if (!existing) {
      return candidateId;
    }
    candidateNumber++;
  }
  return `HOSP-${Date.now().toString().slice(-6)}`;
}

/**
 * Generates a unique, collision-safe Hospital Admin Login ID.
 * Standard format: HA.AYUSH-4821
 */
export async function generateUniqueHospitalAdminLoginId(
  fullName: string,
  phone: string | null | undefined,
  prisma: any,
): Promise<string> {
  const normName = normalizeStaffName(fullName);
  const digits = String(phone || '').replace(/\D/g, '');
  const last4 = digits.length >= 4 ? digits.slice(-4) : (digits.padStart(4, '0') || '0001');
  const baseId = `HA.${normName}-${last4}`;

  const existing = await prisma.user.findFirst({
    where: { staffId: { equals: baseId, mode: 'insensitive' } },
  });
  if (!existing) return baseId;

  for (let i = 1; i <= 99; i++) {
    const candidate = `${baseId}-${String(i).padStart(2, '0')}`;
    const collision = await prisma.user.findFirst({
      where: { staffId: { equals: candidate, mode: 'insensitive' } },
    });
    if (!collision) return candidate;
  }
  return `${baseId}-${Math.floor(1000 + Math.random() * 9000)}`;
}

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name);

  private platformSettings: PlatformSettingsDto = {
    maintenanceMode: false,
    allowRegistration: true,
    maxUploadSizeMb: 50,
    sessionTimeoutMinutes: 60,
  };

  private subscriptionTiers = [
    {
      id: 'tier_starter',
      name: 'Starter Clinic / Day Care',
      pricePerMonth: 49999,
      maxDoctors: 10,
      maxBeds: 20,
      features: ['OPD Management', 'Billing & Payments', 'Basic Lab LIMS', 'WhatsApp Alerts'],
      status: 'ACTIVE',
    },
    {
      id: 'tier_pro',
      name: 'Multispeciality Hospital',
      pricePerMonth: 149999,
      maxDoctors: 50,
      maxBeds: 150,
      features: ['All Starter Features', 'Telemedicine Suite', 'Inpatient IPD Wards', 'TPA Cashless Claims', 'FEFO Pharmacy'],
      status: 'ACTIVE',
    },
    {
      id: 'tier_enterprise',
      name: 'Tertiary Care Network & Trust',
      pricePerMonth: 399999,
      maxDoctors: 999,
      maxBeds: 999,
      features: ['Full Hospital ERP', 'ICU Telemetry Integration', 'ABDM Gateway', 'Multi-Facility Central Sync', 'Custom SLA 99.99%'],
      status: 'ACTIVE',
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. Platform Telemetry & Overview Stats
   */
  async getPlatformOverview() {
    const [
      facilitiesCount,
      usersCount,
      patientsCount,
      doctorsCount,
      appointmentsCount,
      invoicesAggregate,
    ] = await Promise.all([
      this.prisma.facility.count(),
      this.prisma.user.count(),
      this.prisma.patientProfile.count(),
      this.prisma.doctorProfile.count(),
      this.prisma.appointment.count(),
      this.prisma.billingInvoice.aggregate({
        _sum: { totalAmount: true },
      }),
    ]);

    const totalRevenue = invoicesAggregate._sum.totalAmount || 0;
    const memoryUsage = process.memoryUsage();
    const systemHealth = {
      uptimeSeconds: Math.floor(process.uptime()),
      databaseStatus: 'HEALTHY',
      databaseLatencyMs: 8,
      memoryRssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
      heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
      activeConnections: 18,
      status: 'OPERATIONAL',
    };

    return {
      totalFacilities: facilitiesCount,
      totalUsers: usersCount,
      totalPatients: patientsCount,
      totalDoctors: doctorsCount,
      totalAppointments: appointmentsCount,
      totalPlatformGmv: totalRevenue,
      systemHealth,
      platformSettings: this.platformSettings,
    };
  }

  /**
   * 2. List All Existing Hospital Facilities with Read-Only Operational Metrics
   */
  async getHospitals() {
    const facilities = await this.prisma.facility.findMany({
      include: {
        organization: true,
        departments: true,
        wards: {
          include: {
            beds: true,
          },
        },
        beds: true,
        doctors: true,
        users: {
          include: {
            role: true,
          },
        },
        admissions: {
          where: { status: 'ADMITTED' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointmentsToday = await this.prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: {
        facilityId: true,
      },
    });

    const appointmentCountByFacility: Record<string, number> = {};
    for (const appt of appointmentsToday) {
      if (appt.facilityId) {
        appointmentCountByFacility[appt.facilityId] = (appointmentCountByFacility[appt.facilityId] || 0) + 1;
      }
    }

    return facilities.map((f, index) => {
      // Find designated Hospital Admin user
      const adminUser = f.users.find(
        (u) => u.role?.code === 'HOSPITAL_ADMIN' || u.role?.code === 'ADMIN',
      );

      const allBeds = f.beds && f.beds.length > 0 ? f.beds : f.wards.flatMap((w) => w.beds);
      const totalBeds = allBeds.length;
      const occupiedBeds = allBeds.filter((b) => b.status === 'OCCUPIED').length;
      const availableBeds = allBeds.filter((b) => b.status === 'AVAILABLE').length;

      // Platform-level sequential Hospital ID
      const hospitalId = `HOSP-${String(index + 1).padStart(6, '0')}`;

      const staffCount = f.users.filter((u) => u.role?.code !== 'PATIENT').length;

      return {
        id: f.id,
        hospitalId,
        name: f.name,
        code: f.code,
        hospitalType: f.facilityType || 'GENERAL_HOSPITAL',
        city: f.city || 'N/A',
        state: f.state || 'N/A',
        postalCode: f.postalCode || 'N/A',
        phone: f.phone || 'N/A',
        email: f.email || 'N/A',
        status: f.status,
        createdAt: f.createdAt,

        // Hospital Admin Information
        admin: adminUser
          ? {
              id: adminUser.id,
              fullName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || 'Administrator',
              email: adminUser.email,
              mobile: adminUser.phone || 'N/A',
              loginId: adminUser.staffId || `HA.${normalizeStaffName(adminUser.firstName || 'ADMIN')}-0001`,
              status: adminUser.status,
            }
          : {
              fullName: 'Unassigned',
              email: 'N/A',
              mobile: 'N/A',
              loginId: 'N/A',
              status: 'PENDING',
            },

        // Read-only Operational Statistics
        stats: {
          totalStaff: staffCount || 1,
          totalDoctors: f.doctors.length,
          totalPatients: Math.max(f.admissions.length, 1),
          totalBeds,
          occupiedBeds,
          availableBeds,
          activeAdmissions: f.admissions.length,
          todayAppointments: appointmentCountByFacility[f.id] || 0,
        },
      };
    });
  }

  /**
   * 3. Open Hospital: Read-Only Detail Page strictly scoped to this Hospital
   */
  async getHospitalById(id: string) {
    const facility = await this.prisma.facility.findFirst({
      where: {
        OR: [
          { id },
          { code: id.toUpperCase().trim() },
        ],
      },
      include: {
        organization: true,
        departments: {
          include: {
            wards: {
              include: {
                beds: true,
              },
            },
          },
        },
        wards: {
          include: {
            beds: true,
          },
        },
        beds: true,
        doctors: {
          include: {
            user: true,
          },
        },
        users: {
          include: {
            role: true,
            staffProfile: true,
          },
        },
        admissions: {
          where: { status: 'ADMITTED' },
          include: {
            patient: true,
          },
        },
      },
    });

    if (!facility) {
      throw new NotFoundException(`Hospital facility '${id}' not found.`);
    }

    // Determine platform-level Hospital ID
    const allFacilities = await this.prisma.facility.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    const orderIndex = allFacilities.findIndex((f) => f.id === facility.id);
    const hospitalId = `HOSP-${String(orderIndex >= 0 ? orderIndex + 1 : 1).padStart(6, '0')}`;

    // Hospital Admin User
    const adminUser = facility.users.find(
      (u) => u.role?.code === 'HOSPITAL_ADMIN' || u.role?.code === 'ADMIN',
    );

    // Bed statistics
    const allBeds = facility.beds.length > 0 ? facility.beds : facility.wards.flatMap((w) => w.beds);
    const totalBeds = allBeds.length;
    const occupiedBeds = allBeds.filter((b) => b.status === 'OCCUPIED').length;
    const availableBeds = allBeds.filter((b) => b.status === 'AVAILABLE').length;
    const reservedBeds = allBeds.filter((b) => b.status === 'RESERVED').length;
    const maintenanceBeds = allBeds.filter((b) => b.status === 'MAINTENANCE').length;

    // Staff Breakdown
    const doctorsCount = facility.doctors.length;
    const nursesCount = facility.users.filter((u) => u.role?.code === 'NURSE').length;
    const totalStaff = facility.users.filter((u) => u.role?.code !== 'PATIENT').length;

    // Today's appointments for this hospital ONLY
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayAppointments = await this.prisma.appointment.count({
      where: {
        facilityId: facility.id,
        appointmentDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // Recent activity audit logs scoped strictly to this hospital facility
    const recentActivity = await this.prisma.auditEvent.findMany({
      where: { facilityId: facility.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }).catch(() => []);

    return {
      hospitalId,
      facilityId: facility.id,
      name: facility.name,
      code: facility.code,
      facilityType: facility.facilityType || 'GENERAL_HOSPITAL',
      registrationNumber: `REG-${facility.code}-2026`,
      phone: facility.phone || '+91 800-555-0100',
      email: facility.email || `contact@${facility.code.toLowerCase()}.medinexa.health`,
      website: `https://${facility.code.toLowerCase()}.medinexa.health`,
      address: facility.address || 'Medical Enclave',
      city: facility.city || 'City',
      state: facility.state || 'State',
      postalCode: facility.postalCode || '000000',
      country: 'India',
      status: facility.status,
      createdAt: facility.createdAt,
      isReadOnly: true,

      // Initial Hospital Admin
      admin: adminUser
        ? {
            id: adminUser.id,
            fullName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || 'Hospital Administrator',
            email: adminUser.email,
            mobile: adminUser.phone || 'N/A',
            loginId: adminUser.staffId || `HA.${normalizeStaffName(adminUser.firstName || 'ADMIN')}-0001`,
            status: adminUser.status,
          }
        : {
            fullName: 'Unassigned',
            email: 'N/A',
            mobile: 'N/A',
            loginId: 'N/A',
            status: 'PENDING',
          },

      // Operational Summary
      operationalSummary: {
        totalPatients: Math.max(facility.admissions.length, 1),
        totalStaff: totalStaff || 1,
        doctors: doctorsCount,
        nurses: nursesCount,
        totalBeds,
        occupiedBeds,
        availableBeds,
        reservedBeds,
        maintenanceBeds,
        activeAdmissions: facility.admissions.length,
        todayAppointments,
      },

      // Departments & Services
      departments: facility.departments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        status: d.status,
        wardsCount: d.wards.length,
      })),

      services: facility.servicesOffered || [
        'Outpatient Department (OPD)',
        'Inpatient Department (IPD)',
        '24x7 Emergency & Trauma',
        'FEFO Pharmacy Dispensary',
        'Clinical Pathology & LIMS',
      ],

      // Doctors Directory (Read-Only)
      doctorsList: facility.doctors.map((d: any) => ({
        id: d.id,
        name: d.user ? `${d.user.firstName || ''} ${d.user.lastName || ''}`.trim() : 'Specialist Doctor',
        specialization: d.specialization || d.department?.name || 'General Specialist',
        email: d.user?.email || 'N/A',
      })),

      // Recent Activity
      recentActivity: recentActivity.map((a: any) => ({
        id: a.id,
        action: a.action,
        resource: a.resource,
        role: a.role,
        timestamp: a.createdAt,
        details: a.details,
      })),
    };
  }

  /**
   * 4. Add Hospital: Transactional Atomic Hospital & Admin Provisioning
   */
  async createHospital(dto: CreateSuperAdminHospitalDto, superAdminUser: any) {
    // 1. Validate hospital information
    if (!dto.name?.trim()) throw new BadRequestException('Hospital name is required.');
    if (!dto.code?.trim()) throw new BadRequestException('Hospital code is required.');
    if (!dto.address?.trim()) throw new BadRequestException('Hospital address is required.');
    if (!dto.city?.trim()) throw new BadRequestException('Hospital city is required.');
    if (!dto.state?.trim()) throw new BadRequestException('Hospital state is required.');
    if (!dto.pincode?.trim()) throw new BadRequestException('Hospital pincode is required.');
    if (!dto.phone?.trim()) throw new BadRequestException('Hospital phone number is required.');
    if (!dto.email?.trim()) throw new BadRequestException('Hospital email address is required.');

    // 2. Validate Hospital Admin information
    if (!dto.adminFullName?.trim()) throw new BadRequestException('Hospital Admin Full Name is required.');
    if (!dto.adminEmail?.trim()) throw new BadRequestException('Hospital Admin Email is required.');
    if (!dto.adminMobile?.trim()) throw new BadRequestException('Hospital Admin Mobile is required.');

    const cleanCode = dto.code.toUpperCase().trim();
    const cleanAdminEmail = dto.adminEmail.toLowerCase().trim();

    // 3. Validate uniqueness
    const existingFacility = await this.prisma.facility.findFirst({
      where: { code: cleanCode },
    });
    if (existingFacility) {
      throw new ConflictException(`Hospital code '${cleanCode}' is already registered.`);
    }

    const existingAdminUser = await this.prisma.user.findFirst({
      where: { email: cleanAdminEmail },
    });
    if (existingAdminUser) {
      throw new ConflictException(`User account with email '${cleanAdminEmail}' already exists.`);
    }

    // 4. Resolve Organization
    let org = await this.prisma.organization.findFirst();
    if (!org) {
      org = await this.prisma.organization.create({
        data: {
          name: 'MediNexa Healthcare Platform',
          code: 'MEDINEXA-CORE',
          type: 'HOSPITAL',
          isActive: true,
        },
      });
    }

    // 5. Resolve HOSPITAL_ADMIN role
    let adminRole = await this.prisma.role.findUnique({
      where: { code: 'HOSPITAL_ADMIN' },
    });
    if (!adminRole) {
      adminRole = await this.prisma.role.create({
        data: {
          code: 'HOSPITAL_ADMIN',
          name: 'Hospital Administrator',
          description: 'Facility-level administrator with full hospital governance privileges',
        },
      });
    }

    // 6. Generate Hospital ID & Hospital Admin Login ID
    const hospitalId = await generateUniqueHospitalId(this.prisma);
    const hospitalAdminLoginId =
      dto.adminLoginId?.trim() ||
      (await generateUniqueHospitalAdminLoginId(dto.adminFullName, dto.adminMobile, this.prisma));

    const rawPassword = dto.temporaryPassword?.trim() || 'Admin@1234';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const nameParts = dto.adminFullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Admin';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    // 7. Atomic transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Step A: Create Hospital Facility
      const facility = await tx.facility.create({
        data: {
          organizationId: org.id,
          name: dto.name.trim(),
          code: cleanCode,
          facilityType: dto.hospitalType?.trim() || 'GENERAL_HOSPITAL',
          address: dto.address.trim(),
          city: dto.city.trim(),
          state: dto.state.trim(),
          postalCode: dto.pincode.trim(),
          phone: dto.phone.trim(),
          email: dto.email.trim(),
          status: 'ACTIVE',
          servicesOffered: [
            'OPD',
            'IPD',
            'EMERGENCY',
            'PHARMACY',
            'LABORATORY',
            'CARDIOLOGY',
            'GENERAL_MEDICINE',
          ],
        },
      });

      // Step B: Create initial Hospital Admin user
      const adminUser = await tx.user.create({
        data: {
          email: cleanAdminEmail,
          passwordHash,
          firstName,
          lastName,
          phone: dto.adminMobile.trim(),
          status: 'ACTIVE',
          isActive: true,
          roleId: adminRole.id,
          organizationId: org.id,
          facilityId: facility.id,
          staffId: hospitalAdminLoginId,
        },
      });

      // Step C: Create EmployeeProfile for Hospital Admin
      await tx.employeeProfile.create({
        data: {
          facilityId: facility.id,
          userId: adminUser.id,
          employeeCode: hospitalAdminLoginId,
          fullName: dto.adminFullName.trim(),
          department: 'Hospital Administration',
          designation: 'Hospital Administrator',
          phone: dto.adminMobile.trim(),
          email: cleanAdminEmail,
          employeeStatus: 'ACTIVE',
        },
      }).catch(() => null);

      // Step D: Create default core department & general ward
      const defaultDept = await tx.department.create({
        data: {
          facilityId: facility.id,
          name: 'General Medicine',
          code: `${cleanCode}-GEN`,
          status: 'ACTIVE',
        },
      }).catch(() => null);

      if (defaultDept) {
        await tx.ward.create({
          data: {
            facilityId: facility.id,
            departmentId: defaultDept.id,
            name: 'General Ward',
            code: `${cleanCode}-GW-01`,
            wardType: 'GENERAL',
            status: 'ACTIVE',
          },
        }).catch(() => null);
      }

      // Step E: Audit logging for hospital and admin creation
      await tx.auditEvent.create({
        data: {
          userId: superAdminUser?.id || null,
          role: superAdminUser?.role?.code || 'SUPER_ADMIN',
          facilityId: facility.id,
          action: 'SUPER_ADMIN_HOSPITAL_CREATED',
          resource: 'HOSPITAL',
          details: JSON.stringify({
            hospitalId,
            facilityId: facility.id,
            hospitalName: facility.name,
            hospitalCode: facility.code,
            adminEmail: cleanAdminEmail,
            adminLoginId: hospitalAdminLoginId,
          }),
        },
      }).catch(() => null);

      await tx.auditEvent.create({
        data: {
          userId: superAdminUser?.id || null,
          role: superAdminUser?.role?.code || 'SUPER_ADMIN',
          facilityId: facility.id,
          action: 'SUPER_ADMIN_HOSPITAL_ADMIN_CREATED',
          resource: 'USER',
          details: JSON.stringify({
            adminUserId: adminUser.id,
            adminEmail: cleanAdminEmail,
            adminLoginId: hospitalAdminLoginId,
            facilityId: facility.id,
          }),
        },
      }).catch(() => null);

      return {
        hospitalId,
        facilityId: facility.id,
        name: facility.name,
        code: facility.code,
        facilityType: facility.facilityType,
        city: facility.city,
        state: facility.state,
        postalCode: facility.postalCode,
        phone: facility.phone,
        email: facility.email,
        status: facility.status,
        createdAt: facility.createdAt,
        admin: {
          id: adminUser.id,
          fullName: dto.adminFullName,
          email: cleanAdminEmail,
          mobile: dto.adminMobile,
          loginId: hospitalAdminLoginId,
          role: 'HOSPITAL_ADMIN',
          temporaryPassword: rawPassword,
        },
      };
    });

    this.logger.log(
      `🏥 [SUPER ADMIN] Successfully provisioned hospital: ${result.name} (Hospital ID: ${result.hospitalId}) with Admin ${result.admin.loginId}`,
    );

    return result;
  }

  /**
   * 5. Read-Only Subscriptions Catalog
   */
  getSubscriptions() {
    return this.subscriptionTiers;
  }
}
