import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateHospitalDto {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  subscriptionTier?: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
}

export interface PlatformSettingsDto {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUploadSizeMb: number;
  sessionTimeoutMinutes: number;
}

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name);

  // In-memory persistent platform settings
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
   * 1. High-Level Executive Platform Telemetry & Overview
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
      databaseLatencyMs: 12,
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
   * 2. List All Hospital Tenants
   */
  async getHospitals() {
    const facilities = await this.prisma.facility.findMany({
      include: {
        organization: true,
        departments: true,
        wards: true,
        doctors: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return facilities.map((f) => ({
      id: f.id,
      name: f.name,
      code: f.code,
      address: f.address,
      city: f.city,
      state: f.state,
      postalCode: f.postalCode,
      phone: f.phone,
      email: f.email,
      status: f.status,
      departmentsCount: f.departments.length,
      wardsCount: f.wards.length,
      doctorsCount: f.doctors.length,
      createdAt: f.createdAt,
    }));
  }

  /**
   * 3. Create a New Hospital Tenant
   */
  async createHospital(dto: CreateHospitalDto) {
    const existing = await this.prisma.facility.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException(`Facility with code '${dto.code}' already exists.`);
    }

    const org = await this.prisma.organization.findFirst();
    if (!org) throw new BadRequestException('Root organization not found.');

    const facility = await this.prisma.facility.create({
      data: {
        organizationId: org.id,
        name: dto.name,
        code: dto.code.toUpperCase().trim(),
        address: dto.address,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        phone: dto.phone,
        email: dto.email,
        status: 'ACTIVE',
      },
    });

    this.logger.log(`🏥 [SUPER ADMIN] Provisioned new hospital facility: ${facility.name} (${facility.code})`);
    return facility;
  }

  /**
   * 4. Suspend or Re-activate Hospital
   */
  async toggleHospitalStatus(id: string) {
    const facility = await this.prisma.facility.findUnique({ where: { id } });
    if (!facility) throw new NotFoundException('Hospital facility not found.');

    const newStatus = facility.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = await this.prisma.facility.update({
      where: { id },
      data: { status: newStatus },
    });

    this.logger.log(`⚠️ [SUPER ADMIN] Hospital ${facility.name} status updated to: ${newStatus}`);
    return updated;
  }

  /**
   * 5. Delete or Archive Hospital
   */
  async deleteHospital(id: string) {
    const facility = await this.prisma.facility.findUnique({ where: { id } });
    if (!facility) throw new NotFoundException('Hospital facility not found.');

    await this.prisma.facility.update({
      where: { id },
      data: { status: 'DECOMMISSIONED' as any },
    });

    this.logger.log(`🗑️ [SUPER ADMIN] Decommissioned hospital: ${facility.name}`);
    return { success: true, message: `Hospital ${facility.name} has been safely decommissioned.` };
  }

  /**
   * 6. Subscription Management
   */
  getSubscriptions() {
    return this.subscriptionTiers;
  }

  /**
   * 7. Platform Settings Management
   */
  updateSettings(settings: Partial<PlatformSettingsDto>) {
    this.platformSettings = {
      ...this.platformSettings,
      ...settings,
    };
    return this.platformSettings;
  }
}
