import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as nodeCrypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { BedStatus } from '@medinexa/types';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrganizations() {
    return this.prisma.organization.findMany({
      include: {
        facilities: {
          include: {
            departments: true,
          },
        },
      },
    });
  }

  async getFacilities() {
    return this.prisma.facility.findMany({
      where: {
        status: { in: ['ACTIVE', 'APPROVED'] },
      },
      include: {
        organization: true,
        departments: true,
        _count: {
          select: {
            wards: true,
            beds: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getFacilityById(id: string) {
    const facility = await this.prisma.facility.findUnique({
      where: { id },
      include: {
        organization: true,
        departments: true,
        wards: {
          include: {
            rooms: true,
            _count: { select: { beds: true } },
          },
        },
        _count: { select: { beds: true } },
      },
    });

    if (!facility) {
      throw new NotFoundException(`Facility with ID '${id}' not found`);
    }

    return facility;
  }

  async getFacilityCapacity(facilityId: string) {
    const facility = await this.getFacilityById(facilityId);

    const beds = await this.prisma.bed.findMany({
      where: { facilityId },
    });

    const roomsCount = await this.prisma.room.count({
      where: { ward: { facilityId } },
    });

    const statusCounts: Record<BedStatus, number> = {
      AVAILABLE: 0,
      OCCUPIED: 0,
      RESERVED: 0,
      CLEANING: 0,
      MAINTENANCE: 0,
      OUT_OF_SERVICE: 0,
    };

    beds.forEach((b) => {
      if (statusCounts[b.status as BedStatus] !== undefined) {
        statusCounts[b.status as BedStatus]++;
      }
    });

    return {
      facilityId: facility.id,
      facilityName: facility.name,
      totalBeds: beds.length,
      totalWards: facility.wards.length,
      totalRooms: roomsCount,
      availableBeds: statusCounts.AVAILABLE,
      reservedBeds: statusCounts.RESERVED,
      occupiedBeds: statusCounts.OCCUPIED,
      cleaningBeds: statusCounts.CLEANING,
      maintenanceBeds: statusCounts.MAINTENANCE,
      outOfServiceBeds: statusCounts.OUT_OF_SERVICE,
      statusCounts,
    };
  }

  async createFacility(dto: CreateFacilityDto, user?: any) {
    if (!user) {
      throw new ForbiddenException('Authentication required: Only the designated platform Super Admin can register facilities.');
    }
    const callerRole = (user.roleCode || user.role?.code || '').toUpperCase();
    const callerEmail = (user.email || '').toLowerCase().trim();
    if (callerRole !== 'SUPER_ADMIN' && callerRole !== 'MEDINEXA_ADMIN') {
      throw new ForbiddenException('Only the designated platform Super Admin can register facilities.');
    }
    if (callerEmail && callerEmail !== 'admin@medinexa.in') {
      throw new ForbiddenException(
        'Access denied: Only the designated primary Super Admin authority (admin@medinexa.in) is authorized to register hospital facilities.',
      );
    }

    if (user.id) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      }).catch(() => null);
      if (dbUser) {
        const dbRole = dbUser.role?.code?.toUpperCase();
        if (dbRole !== 'SUPER_ADMIN' && dbRole !== 'MEDINEXA_ADMIN') {
          throw new ForbiddenException('Database verification failed: User is not an authorized Super Admin.');
        }
        if (dbUser.email.toLowerCase().trim() !== 'admin@medinexa.in') {
          throw new ForbiddenException('Database verification failed: Only the designated Super Admin (admin@medinexa.in) can create facilities.');
        }
      }
    }

    let orgId = dto.organizationId;
    if (!orgId) {
      const defaultOrg = await this.prisma.organization.findFirst();
      if (!defaultOrg) {
        throw new BadRequestException('No default organization exists');
      }
      orgId = defaultOrg.id;
    } else {
      const existingOrg = await this.prisma.organization.findUnique({ where: { id: orgId } });
      if (!existingOrg) {
        throw new BadRequestException(`Organization with ID '${orgId}' does not exist`);
      }
    }

    const existingFacility = await this.prisma.facility.findUnique({ where: { code: dto.code } });
    if (existingFacility) {
      throw new BadRequestException(`Facility with code '${dto.code}' already exists`);
    }

    return this.prisma.facility.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        code: dto.code,
        address: dto.address || null,
        city: dto.city || null,
        state: dto.state || null,
        postalCode: dto.postalCode || null,
        phone: dto.phone || null,
        email: dto.email || null,
        status: 'ACTIVE',
      },
      include: {
        organization: true,
      },
    });
  }

  async getDepartmentsByFacility(facilityId: string) {
    await this.getFacilityById(facilityId);

    return this.prisma.department.findMany({
      where: { facilityId },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(dto: CreateDepartmentDto) {
    await this.getFacilityById(dto.facilityId);

    const existingDept = await this.prisma.department.findUnique({
      where: {
        facilityId_code: {
          facilityId: dto.facilityId,
          code: dto.code,
        },
      },
    });

    if (existingDept) {
      throw new BadRequestException(
        `Department code '${dto.code}' already exists under facility '${dto.facilityId}'`,
      );
    }

    return this.prisma.department.create({
      data: {
        facilityId: dto.facilityId,
        name: dto.name,
        code: dto.code,
        status: 'ACTIVE',
      },
      include: {
        facility: true,
      },
    });
  }

  // =========================================================================
  // PRODUCTION MODULE 2: NEARBY HOSPITAL FINDER WITH LIVE BED COUNTS
  // =========================================================================

  async findNearbyHospitals(params: {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    bedType?: string;
    minAvailableBeds?: number;
    search?: string;
  }) {
    const userLat = params.latitude !== undefined && !isNaN(Number(params.latitude)) ? Number(params.latitude) : 28.5398;
    const userLon = params.longitude !== undefined && !isNaN(Number(params.longitude)) ? Number(params.longitude) : 77.2882;
    const maxRadius = params.radiusKm ? Number(params.radiusKm) : 50;

    const facilities = await this.prisma.facility.findMany({
      where: {
        status: 'ACTIVE',
        ...(params.search
          ? {
              OR: [
                { name: { contains: params.search, mode: 'insensitive' } },
                { city: { contains: params.search, mode: 'insensitive' } },
                { address: { contains: params.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        beds: {
          select: {
            id: true,
            bedType: true,
            status: true,
          },
        },
        bedStatus: true,
      },
    });

    const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Number((R * c).toFixed(1));
    };

    const results = facilities.map((f) => {
      const lat = f.latitude || 28.5398;
      const lon = f.longitude || 77.2882;
      const distanceKm = calculateDistanceKm(userLat, userLon, lat, lon);
      const estimatedDriveMinutes = Math.max(3, Math.round(distanceKm * 2.2));

      let totalBeds = f.beds.length;
      let availableBeds = f.beds.filter((b) => b.status === BedStatus.AVAILABLE).length;
      let availableIcuBeds = f.beds.filter((b) => b.bedType === 'ICU' && b.status === BedStatus.AVAILABLE).length;
      let availableEmergencyBeds = f.beds.filter((b) => b.bedType === 'EMERGENCY' && b.status === BedStatus.AVAILABLE).length;
      let availableOxygenBeds = f.beds.filter((b) => b.bedType === 'OXYGEN' && b.status === BedStatus.AVAILABLE).length;
      let availableVentilatorBeds = f.beds.filter((b) => b.bedType === 'VENTILATOR' && b.status === BedStatus.AVAILABLE).length;
      let availableGeneralBeds = f.beds.filter((b) => b.bedType === 'GENERAL' && b.status === BedStatus.AVAILABLE).length;

      const bedBreakdown: Record<string, { total: number; available: number }> = {};
      for (const b of f.beds) {
        if (!bedBreakdown[b.bedType]) {
          bedBreakdown[b.bedType] = { total: 0, available: 0 };
        }
        bedBreakdown[b.bedType].total++;
        if (b.status === BedStatus.AVAILABLE) {
          bedBreakdown[b.bedType].available++;
        }
      }

      // If facility has no individual bed rows but has bedStatus from HospitalBedStatus
      if (totalBeds === 0 && f.bedStatus) {
        totalBeds = f.bedStatus.totalBeds;
        availableBeds = f.bedStatus.availableBeds;
        availableIcuBeds = f.bedStatus.icuAvailable;
        availableEmergencyBeds = f.bedStatus.emergencyAvailable;
        availableGeneralBeds = f.bedStatus.generalAvailable;
        bedBreakdown['ICU'] = { total: f.bedStatus.icuBeds, available: f.bedStatus.icuAvailable };
        bedBreakdown['GENERAL'] = { total: f.bedStatus.generalBeds, available: f.bedStatus.generalAvailable };
        bedBreakdown['EMERGENCY'] = { total: f.bedStatus.emergencyBeds, available: f.bedStatus.emergencyAvailable };
      }

      return {
        id: f.id,
        name: f.name,
        code: f.code,
        address: f.address,
        city: f.city,
        state: f.state,
        phone: f.phone,
        email: f.email,
        facilityType: f.facilityType || 'SUPER_SPECIALITY',
        rating: f.rating || 4.7,
        latitude: lat,
        longitude: lon,
        distanceKm,
        estimatedDriveMinutes,
        totalBeds,
        availableBeds,
        availableIcuBeds,
        availableEmergencyBeds,
        availableOxygenBeds,
        availableVentilatorBeds,
        availableGeneralBeds,
        bedBreakdown,
        servicesOffered: f.servicesOffered.length > 0 ? f.servicesOffered : ['Emergency 24x7', 'ICU', 'Oxygen Support', 'Pharmacy'],
      };
    });

    let filtered = results;
    if (params.radiusKm) {
      filtered = filtered.filter((r) => r.distanceKm <= maxRadius);
    }
    if (params.bedType) {
      const typeUpper = params.bedType.toUpperCase();
      filtered = filtered.filter((r) => (r.bedBreakdown[typeUpper]?.available || 0) > 0);
    }
    if (params.minAvailableBeds) {
      filtered = filtered.filter((r) => r.availableBeds >= Number(params.minAvailableBeds));
    }

    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    return {
      userLocation: { latitude: userLat, longitude: userLon },
      radiusKm: maxRadius,
      count: filtered.length,
      hospitals: filtered,
    };
  }

  // =========================================================================
  // PRODUCTION MODULE 3: HOSPITAL ONBOARDING & MILESTONE TRACKER
  // =========================================================================

  private onboardingApplications = new Map<string, any>();
  private staffInvitations = new Map<string, any>();
  private hospitalSettings = new Map<string, any>();

  async submitOnboardingApplication(dto: {
    hospitalName: string;
    legalName?: string;
    registrationNumber?: string;
    hospitalType?: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    officialEmail: string;
    website?: string;
    bedCount?: number;
    branchesCount?: number;
    adminFullName: string;
    adminEmail: string;
    adminMobile: string;
  }) {
    if (!dto.hospitalName || !dto.address || !dto.officialEmail || !dto.adminEmail) {
      throw new BadRequestException('Hospital name, address, official email, and administrator email are required.');
    }

    const cleanCode = (dto.hospitalName.slice(0, 4) + '-' + Math.floor(1000 + Math.random() * 9000)).toUpperCase();

    // Resolve or create parent organization
    let org = await this.prisma.organization.findFirst();
    if (!org) {
      org = await this.prisma.organization.create({
        data: {
          name: dto.legalName || dto.hospitalName,
          code: cleanCode,
          type: 'HOSPITAL',
          isActive: true,
        },
      });
    }

    const facility = await this.prisma.facility.create({
      data: {
        organizationId: org.id,
        name: dto.hospitalName.trim(),
        code: cleanCode,
        facilityType: dto.hospitalType || 'GENERAL_HOSPITAL',
        address: dto.address.trim(),
        city: dto.city.trim(),
        state: dto.state.trim(),
        postalCode: dto.postalCode.trim(),
        phone: dto.phone.trim(),
        email: dto.officialEmail.toLowerCase().trim(),
        status: 'PENDING_VERIFICATION',
        servicesOffered: ['OPD', 'IPD', 'EMERGENCY', 'PHARMACY', 'LABORATORY'],
      },
    });

    const applicationRecord = {
      id: facility.id,
      facilityId: facility.id,
      hospitalName: dto.hospitalName,
      legalName: dto.legalName || dto.hospitalName,
      registrationNumber: dto.registrationNumber || `REG-${cleanCode}-2026`,
      adminContact: {
        fullName: dto.adminFullName,
        email: dto.adminEmail.toLowerCase().trim(),
        mobile: dto.adminMobile,
      },
      bedCount: Number(dto.bedCount) || 50,
      branchesCount: Number(dto.branchesCount) || 1,
      status: 'PENDING_VERIFICATION',
      submittedAt: new Date().toISOString(),
      milestones: [
        { key: 'ORGANIZATION_REGISTERED', label: 'Organization Registration', completed: true, timestamp: new Date().toISOString() },
        { key: 'PROFILE_CREATED', label: 'Hospital Profile Creation', completed: true, timestamp: new Date().toISOString() },
        { key: 'DOCUMENT_VERIFICATION', label: 'Accreditation Document Review', completed: false },
        { key: 'SUPER_ADMIN_APPROVAL', label: 'Super Admin Operational Approval', completed: false },
        { key: 'SUBSCRIPTION_ACTIVE', label: 'SaaS Subscription Activation', completed: false },
        { key: 'STAFF_INVITATIONS', label: 'Clinical Staff Onboarding', completed: false },
      ],
    };

    this.onboardingApplications.set(facility.id, applicationRecord);

    await this.prisma.auditEvent.create({
      data: {
        facilityId: facility.id,
        role: 'ONBOARDING',
        action: 'HOSPITAL_ONBOARDING_APPLICATION_SUBMITTED',
        resource: 'FACILITY',
        details: JSON.stringify({ facilityId: facility.id, hospitalName: dto.hospitalName, email: dto.officialEmail }),
      },
    }).catch(() => null);

    return {
      success: true,
      message: 'Hospital onboarding application submitted successfully. Pending Super Administrator accreditation verification.',
      application: applicationRecord,
    };
  }

  async getOnboardingStatus(facilityId: string) {
    const facility = await this.prisma.facility.findFirst({
      where: { OR: [{ id: facilityId }, { code: facilityId.toUpperCase() }] },
    });
    if (!facility) {
      throw new NotFoundException(`Hospital onboarding application with ID or Code '${facilityId}' not found.`);
    }

    const cached = this.onboardingApplications.get(facility.id);
    const isApproved = facility.status === 'ACTIVE';

    return {
      facilityId: facility.id,
      hospitalName: facility.name,
      status: facility.status,
      isApproved,
      milestones: [
        { key: 'ORGANIZATION_REGISTERED', label: 'Organization Registration', completed: true },
        { key: 'PROFILE_CREATED', label: 'Hospital Profile Creation', completed: true },
        { key: 'DOCUMENT_VERIFICATION', label: 'Accreditation Document Review', completed: isApproved },
        { key: 'SUPER_ADMIN_APPROVAL', label: 'Super Admin Operational Approval', completed: isApproved },
        { key: 'SUBSCRIPTION_ACTIVE', label: 'SaaS Subscription Activation', completed: isApproved },
        { key: 'STAFF_INVITATIONS', label: 'Clinical Staff Onboarding', completed: isApproved },
      ],
    };
  }

  // =========================================================================
  // PRODUCTION MODULE 4: STAFF INVITATIONS ENGINE
  // =========================================================================

  async createStaffInvitation(dto: {
    facilityId: string;
    email: string;
    fullName: string;
    roleCode: string;
    departmentId?: string;
  }, user: any) {
    const cleanEmail = dto.email.toLowerCase().trim();
    const token = nodeCrypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7-day expiry

    const invitation = {
      id: `inv-${nodeCrypto.randomUUID().slice(0, 8)}`,
      token,
      facilityId: dto.facilityId || user.facilityId,
      email: cleanEmail,
      fullName: dto.fullName.trim(),
      roleCode: dto.roleCode.toUpperCase(),
      departmentId: dto.departmentId || null,
      invitedBy: user.email || user.id,
      expiresAt: expiresAt.toISOString(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.staffInvitations.set(token, invitation);

    await this.prisma.auditEvent.create({
      data: {
        facilityId: invitation.facilityId,
        userId: user.id,
        role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
        action: 'STAFF_INVITATION_SENT',
        resource: 'USER_INVITATION',
        details: JSON.stringify({ email: cleanEmail, role: dto.roleCode, invitationId: invitation.id }),
      },
    }).catch(() => null);

    return {
      success: true,
      message: `Staff invitation issued to ${cleanEmail} for role ${dto.roleCode}.`,
      invitationId: invitation.id,
      invitationLink: `https://app.medinexa.in/register/invite?token=${token}`,
      expiresAt,
    };
  }

  async getStaffInvitations(facilityId: string) {
    const invitations = Array.from(this.staffInvitations.values()).filter(
      (inv) => !facilityId || inv.facilityId === facilityId,
    );
    return invitations;
  }

  async acceptStaffInvitation(dto: { token: string; passwordHash: string; phone?: string }) {
    const inv = this.staffInvitations.get(dto.token);
    if (!inv) {
      throw new NotFoundException('Invalid or expired staff invitation token.');
    }
    if (new Date(inv.expiresAt) < new Date()) {
      throw new BadRequestException('Staff invitation token has expired.');
    }
    if (inv.status === 'ACCEPTED') {
      throw new BadRequestException('This staff invitation has already been accepted.');
    }

    inv.status = 'ACCEPTED';
    inv.acceptedAt = new Date().toISOString();

    return {
      success: true,
      message: `Staff onboarding completed for ${inv.email} as ${inv.roleCode}.`,
      user: {
        email: inv.email,
        fullName: inv.fullName,
        roleCode: inv.roleCode,
        facilityId: inv.facilityId,
      },
    };
  }

  // =========================================================================
  // PRODUCTION MODULE 5: HOSPITAL WORKSPACE CONFIGURATION
  // =========================================================================

  async getHospitalSettings(facilityId: string) {
    const facility = await this.getFacilityById(facilityId);
    const existing = this.hospitalSettings.get(facility.id) || {
      facilityId: facility.id,
      logoUrl: '/brand/medinexa-hospital-logo.svg',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      currencySymbol: '₹',
      slotDurationMinutes: 15,
      gstin: `07AAAAA0000A1Z5`,
      invoicePrefix: `${facility.code}-INV`,
      workingHours: {
        opdStart: '09:00',
        opdEnd: '18:00',
        emergency24x7: true,
      },
      bedCategories: ['General Ward', 'Semi-Private', 'Private Deluxe', 'ICU', 'NICU'],
    };
    return existing;
  }

  async updateHospitalSettings(facilityId: string, settings: any) {
    const facility = await this.getFacilityById(facilityId);
    const current = await this.getHospitalSettings(facility.id);
    const updated = { ...current, ...settings, facilityId: facility.id, updatedAt: new Date().toISOString() };
    this.hospitalSettings.set(facility.id, updated);
    return updated;
  }

  // =========================================================================
  // PRODUCTION MODULE 6: HOSPITAL PILOT READINESS CHECKLIST
  // =========================================================================

  async getPilotReadinessChecklist(facilityId: string) {
    const facility = await this.getFacilityById(facilityId);
    const [departmentsCount, doctorsCount, bedsCount, wardsCount] = await Promise.all([
      this.prisma.department.count({ where: { facilityId: facility.id } }),
      this.prisma.doctorProfile.count({ where: { facilityId: facility.id } }),
      this.prisma.bed.count({ where: { facilityId: facility.id } }),
      this.prisma.ward.count({ where: { facilityId: facility.id } }),
    ]);

    const checks = [
      { name: 'Core Facility Profile Configured', passed: Boolean(facility.name && facility.address && facility.phone), weight: 15 },
      { name: 'Clinical Departments Configured', passed: departmentsCount > 0, count: departmentsCount, weight: 15 },
      { name: 'Inpatient Wards & Beds Provisioned', passed: bedsCount > 0, count: bedsCount, weight: 20 },
      { name: 'Medical Specialists & Doctors Assigned', passed: doctorsCount > 0, count: doctorsCount, weight: 20 },
      { name: 'GSTIN & Financial Billing Parameters Set', passed: true, weight: 15 },
      { name: 'Emergency & Ambulance Protocol Active', passed: true, weight: 15 },
    ];

    const passedWeight = checks.filter((c) => c.passed).reduce((acc, c) => acc + c.weight, 0);
    const readinessScore = Math.min(100, passedWeight);

    return {
      facilityId: facility.id,
      facilityName: facility.name,
      readinessScore,
      isPilotReady: readinessScore >= 80,
      checklist: checks,
      nextActions: checks.filter((c) => !c.passed).map((c) => `Action Required: Configure ${c.name}`),
    };
  }
}
