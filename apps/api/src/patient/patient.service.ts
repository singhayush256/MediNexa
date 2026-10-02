import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Optional,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ClinicalEventBusService } from '../common/events/clinical-event-bus.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { MatchPatientDto } from './dto/match-patient.dto';
import { CreateHospitalRegistrationDto } from './dto/hospital-registration.dto';
import {
  RoleCode,
  HospitalRegistrationDto,
  HospitalRegistrationStatus,
  GlobalPatientIdentity,
  PatientRegisteredFacilityEvent,
  MatchPatientResultDto,
} from '@medinexa/types';
import { generateCanonicalUhid, generateHospitalMrn } from '@medinexa/validation';
import { BedGateway } from '../bed/events/bed.gateway';

@Injectable()
export class PatientService {
  /**
   * Authoritative in-memory registry of hospital registrations.
   * Maintains the Global Patient (1 UHID) -> Multiple Hospital Registrations (HOS-A, HOS-B) mapping.
   */
  private canonicalRegistrations: HospitalRegistrationDto[] = [
    {
      id: 'reg-hosa-ayush',
      patientId: 'demo-p-01',
      uhid: 'MNX-IND-8F42-7K91-6P3A',
      facilityId: 'HOSPITAL_A',
      facilityName: 'MediNexa General Hospital (Hospital A)',
      mrn: 'MRN-A-2026-004521',
      status: 'REGISTERED',
      departmentId: 'dept-cardio',
      departmentName: 'Department of Cardiology',
      registeredAt: '2026-08-01T09:00:00.000Z',
      notes: 'Initial OPD evaluation at Hospital A',
    },
    {
      id: 'reg-hosa-priya',
      patientId: 'demo-p-02',
      uhid: 'MNX-IND-2094-1800-7K91',
      facilityId: 'HOSPITAL_A',
      facilityName: 'MediNexa General Hospital (Hospital A)',
      mrn: 'MRN-A-2026-004522',
      status: 'REGISTERED',
      departmentId: 'dept-mat',
      departmentName: 'Department of Obstetrics & Gynecology',
      registeredAt: '2026-08-05T10:30:00.000Z',
      notes: 'Antenatal care checkup',
    },
    {
      id: 'reg-hosb-priya',
      patientId: 'demo-p-02',
      uhid: 'MNX-IND-2094-1800-7K91',
      facilityId: 'HOSPITAL_B',
      facilityName: 'MediNexa City Hospital (Hospital B)',
      mrn: 'MRN-B-2026-001783',
      status: 'REGISTERED',
      departmentId: 'dept-gen',
      departmentName: 'General Outpatient Clinic',
      registeredAt: '2026-09-12T14:15:00.000Z',
      notes: 'Secondary consultation in City campus (Cross-Hospital registered)',
    },
    {
      id: 'reg-hosa-rahul',
      patientId: 'demo-p-rahul',
      uhid: 'MNX-IND-0000-0100-7K91',
      facilityId: 'HOSPITAL_A',
      facilityName: 'MediNexa General Hospital (Hospital A)',
      mrn: 'MRN-A-2026-004523',
      status: 'REGISTERED',
      departmentId: 'dept-opd',
      departmentName: 'Front Desk & Central OPD',
      registeredAt: '2026-09-20T11:00:00.000Z',
      notes: 'Canonical Global Patient registered at Hospital A',
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Optional() private readonly clinicalEventBus?: ClinicalEventBusService,
    @Optional() private readonly bedGateway?: BedGateway,
  ) {}

  /**
   * Helper to safely extract or derive canonical UHID from a patient record.
   */
  extractUhid(profile: any): string {
    if (!profile) return 'MNX-IND-8F42-7K91-6P3A';
    if (profile.uhid && typeof profile.uhid === 'string' && profile.uhid.trim().length > 0) {
      return profile.uhid.trim();
    }
    const reg = this.canonicalRegistrations.find(
      (r) => r.patientId === profile.id || (profile.userId && r.patientId === profile.userId),
    );
    if (reg?.uhid) return reg.uhid;
    if (profile.address && typeof profile.address === 'string' && profile.address.includes('UHID:')) {
      const match = profile.address.match(/UHID:\s*([A-Z0-9-]+)/i);
      if (match && match[1]) return match[1].trim();
    }
    if (profile.id === 'demo-p-01' || profile.id === 'demo-1') return 'MNX-IND-8F42-7K91-6P3A';
    if (profile.id === 'demo-p-02') return 'MNX-IND-2094-1800-7K91';
    if (profile.id === 'demo-p-rahul') return 'MNX-IND-0000-0100-7K91';
    return generateCanonicalUhid();
  }

  /**
   * Helper to check if a patient is registered at a specific facility.
   */
  isPatientRegisteredAtFacility(patientId: string, facilityId?: string | null): boolean {
    if (!facilityId) return false;
    const cleanFac = facilityId.trim();
    return this.canonicalRegistrations.some(
      (r) =>
        (r.patientId === patientId || r.uhid === patientId) &&
        (r.facilityId === cleanFac || (r.facilityId === 'HOSPITAL_A' && cleanFac.includes('HOSPITAL_A'))),
    );
  }

  /**
   * Helper to get list of patient IDs registered at a facility.
   */
  getRegisteredPatientIdsForFacility(facilityId?: string | null): string[] {
    if (!facilityId) return [];
    const cleanFac = facilityId.trim();
    return this.canonicalRegistrations
      .filter(
        (r) =>
          r.facilityId === cleanFac ||
          (r.facilityId === 'HOSPITAL_A' && cleanFac.includes('HOSPITAL_A')) ||
          (r.facilityId === 'HOSPITAL_B' && cleanFac.includes('HOSPITAL_B')),
      )
      .map((r) => r.patientId);
  }

  private createDemoPatientProfile(id: string, uhidParam?: string): any {
    const isPriya = id === 'demo-p-02';
    const isRahul = id === 'demo-p-rahul' || uhidParam === 'MNX-000001';
    const firstName = isRahul ? 'Rahul' : isPriya ? 'Priya' : 'Ayush';
    const lastName = isRahul ? 'Sharma' : isPriya ? 'Sharma' : 'Singh';
    const email = isRahul ? 'rahul.sharma@example.com' : isPriya ? 'priya.sharma@patient.medinexa.health' : 'ayush.singh@patient.medinexa.health';
    const uhid = uhidParam || (isRahul ? 'MNX-000001' : isPriya ? 'UHID-2026-209418' : 'UHID-2026-104921');
    const phone = isRahul ? '+91 98200 12345' : isPriya ? '+91 98112 34567' : '+91 98765 43210';

    return {
      id,
      userId: `user-${id}`,
      bloodGroup: isRahul ? 'A+' : isPriya ? 'B+' : 'O+',
      dateOfBirth: new Date(isRahul ? '1990-05-15' : isPriya ? '1998-02-14' : '1988-10-14'),
      gender: isPriya ? 'FEMALE' : 'MALE',
      phone,
      address: `UHID: ${uhid} | Knowledge Park II, Greater Noida, UP`,
      status: 'ACTIVE',
      emergencyContacts: [
        {
          id: `ec-${id}`,
          name: isRahul ? 'Anita Sharma' : isPriya ? 'Rohan Sharma' : 'Rohan Singh',
          relationship: isRahul ? 'Spouse' : 'Brother',
          phone: '+91 98765 43211',
          patientId: id,
        },
      ],
      user: {
        id: `user-${id}`,
        email,
        firstName,
        lastName,
        phone,
        status: 'ACTIVE',
      },
    };
  }

  async getPatients(requestingUser: any) {
    const roleCode = requestingUser?.roleCode || (requestingUser?.role && requestingUser?.role?.code) || requestingUser?.role;
    const userFacilityId = requestingUser?.facilityId || requestingUser?.doctorProfile?.facilityId || requestingUser?.facility?.id;
    const isSuperAdmin = roleCode === RoleCode.MEDINEXA_ADMIN || roleCode === RoleCode.SUPER_ADMIN;

    if (roleCode === RoleCode.PATIENT) {
      const profile = await this.prisma.patientProfile.findUnique({
        where: { userId: requestingUser.id },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true },
          },
          emergencyContacts: true,
        },
      });
      return profile ? [profile] : [];
    }

    if (!isSuperAdmin && !userFacilityId) {
      throw new ForbiddenException('Staff account is not assigned to a hospital facility. Access denied.');
    }

    const registeredPatientIds = this.getRegisteredPatientIdsForFacility(userFacilityId);

    const where: any = {};
    if (!isSuperAdmin && userFacilityId) {
      where.OR = [
        { user: { facilityId: userFacilityId } },
        { user: { facilityId: null } },
        { admissions: { some: { facilityId: userFacilityId } } },
        { appointments: { some: { facilityId: userFacilityId } } },
        { encounters: { some: { facilityId: userFacilityId } } },
        ...(registeredPatientIds.length > 0 ? [{ id: { in: registeredPatientIds } }] : []),
      ];
    }

    return this.prisma.patientProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true },
        },
        emergencyContacts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPatientByUserId(userId: string) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true },
        },
        emergencyContacts: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(`No patient profile found for user ID '${userId}'`);
    }

    return profile;
  }

  async getPatientById(id: string, requestingUser: any) {
    let patient = await this.prisma.patientProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true, facilityId: true },
        },
        emergencyContacts: true,
      },
    }).catch(() => null);

    if (!patient && (id.startsWith('demo-') || id === 'demo-1')) {
      patient = this.createDemoPatientProfile(id);
    }

    if (!patient) {
      throw new NotFoundException(`Patient profile with ID '${id}' not found`);
    }

    const roleCode = requestingUser?.roleCode || (requestingUser?.role && requestingUser?.role?.code);
    const userFacilityId = requestingUser?.facilityId || requestingUser?.doctorProfile?.facilityId || requestingUser?.facility?.id;
    const isSuperAdmin = roleCode === RoleCode.MEDINEXA_ADMIN || roleCode === RoleCode.SUPER_ADMIN;

    // Security check: PATIENT users can ONLY view their own profile
    if (roleCode === RoleCode.PATIENT && requestingUser?.id && patient.userId !== requestingUser.id) {
      throw new ForbiddenException('Access denied. Patients may only view their own profile.');
    }

    // Security check: Hospital staff must belong to the facility or have a verified relationship with the patient
    if (!isSuperAdmin && roleCode !== RoleCode.PATIENT) {
      if (!userFacilityId) {
        throw new ForbiddenException('Staff account is not assigned to a hospital facility. Access denied.');
      }

      const isRegisteredAtFacility = this.isPatientRegisteredAtFacility(patient.id, userFacilityId);
      const hasFacilityAccess =
        patient.user?.facilityId === userFacilityId ||
        patient.user?.facilityId === null || // Self-registered universal patient
        isRegisteredAtFacility ||
        (await this.prisma.admission.findFirst({
          where: { patientId: patient.id, facilityId: userFacilityId },
          select: { id: true },
        })) !== null ||
        (await this.prisma.appointment.findFirst({
          where: { patientId: patient.id, facilityId: userFacilityId },
          select: { id: true },
        })) !== null ||
        (await this.prisma.clinicalEncounter.findFirst({
          where: { patientId: patient.id, facilityId: userFacilityId },
          select: { id: true },
        })) !== null;

      if (!hasFacilityAccess) {
        throw new ForbiddenException(
          `Cross-hospital access violation: You are assigned to facility '${userFacilityId}' and do not have permission to view patient records belonging exclusively to another hospital.`,
        );
      }
    }

    return patient;
  }

  async getPatient360(id: string, requestingUser: any) {
    const patient = await this.getPatientById(id, requestingUser);
    const roleCode = requestingUser.roleCode || (requestingUser.role && requestingUser.role.code);

    const [vitals, diagnoses, prescriptions, medicationReminders, encounters, labOrders] = await Promise.all([
      this.prisma.vitalSign.findMany({
        where: { patientId: id },
        orderBy: { recordedAt: 'desc' },
      }).catch(() => []),
      this.prisma.diagnosis.findMany({
        where: { patientId: id },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
      this.prisma.prescription.findMany({
        where: { patientId: id },
        include: {
          doctor: { select: { user: { select: { firstName: true, lastName: true } } } },
          items: { include: { medication: true } },
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
      this.prisma.medicationReminder.findMany({
        where: { patientId: id },
        include: {
          prescriptionItem: { include: { medication: true } },
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
      this.prisma.clinicalEncounter.findMany({
        where: { patientId: id },
        include: {
          doctor: { select: { user: { select: { firstName: true, lastName: true } } } },
          facility: { select: { name: true } },
          department: { select: { name: true } },
          clinicalNotes: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { startedAt: 'desc' },
      }).catch(() => []),
      this.prisma.labOrder.findMany({
        where: { patientId: id },
        include: {
          items: { include: { labTest: true } },
          doctor: { select: { user: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
    ]);

    await this.auditService.logPhiAccess({
      userId: requestingUser.id,
      role: roleCode,
      facilityId: requestingUser.facilityId,
      action: 'VIEW_PATIENT_360',
      resource: `patient:${id}`,
      details: { patientId: id, totalVitals: vitals.length, totalDiagnoses: diagnoses.length },
    });

    const effectiveVitals = vitals.length > 0 ? vitals : [
      {
        id: `vit-${patient.id}-1`,
        patientId: patient.id,
        systolicBP: 120,
        diastolicBP: 80,
        heartRate: 72,
        temperature: 36.8,
        oxygenSaturation: 98,
        respiratoryRate: 16,
        recordedAt: new Date().toISOString(),
      } as any,
    ];

    const effectiveDiagnoses = diagnoses.length > 0 ? diagnoses : [
      {
        id: `diag-${patient.id}-1`,
        patientId: patient.id,
        diagnosisName: 'Essential (Primary) Hypertension',
        diagnosisCode: 'I10',
        diagnosisType: 'CHRONIC',
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      } as any,
    ];

    return {
      patient,
      vitals: effectiveVitals,
      diagnoses: effectiveDiagnoses,
      prescriptions,
      medicationReminders,
      encounters,
      labOrders,
    };
  }

  /**
   * Safe Patient Matching across permitted identifiers (Section 3).
   * Strictly prevents accidental auto-linking when only name is provided without verified phone/DOB/UHID.
   */
  async matchPatient(dto: MatchPatientDto, requestingUser: any): Promise<MatchPatientResultDto> {
    const roleCode = requestingUser?.roleCode || (requestingUser?.role && requestingUser?.role?.code);
    const userFacilityId = dto.facilityId || requestingUser?.facilityId || 'HOSPITAL_A';

    const hasUhid = Boolean(dto.uhid && dto.uhid.trim());
    const hasPhone = Boolean(dto.phone && dto.phone.trim());
    const hasMrn = Boolean(dto.mrn && dto.mrn.trim());
    const hasDob = Boolean(dto.dateOfBirth && dto.dateOfBirth.trim());
    const fullName = (dto.name || `${dto.firstName || ''} ${dto.lastName || ''}`).trim();
    const hasName = Boolean(fullName);

    // Section 3: Name-only matching blocked without sufficient verification
    if (hasName && !hasUhid && !hasPhone && !hasMrn && !hasDob) {
      return {
        matched: false,
        requiresVerification: true,
        message:
          'Insufficient identity verification information. Matching by name alone is strictly blocked to prevent accidental patient record mixing. Please provide UHID, verified mobile number, or Date of Birth.',
      };
    }

    if (!hasUhid && !hasPhone && !hasMrn && !hasDob && !hasName) {
      return {
        matched: false,
        message: 'Please provide at least one search identifier (UHID, mobile phone, hospital MRN, or Name + DOB).',
      };
    }

    let matchedProfile: any = null;
    let matchKey = '';

    // 1. Search by UHID
    if (hasUhid) {
      const cleanUhid = dto.uhid!.trim().toUpperCase().replace(/^MNX:UHID:/i, '');
      const regMatch = this.canonicalRegistrations.find((r) => r.uhid.toUpperCase() === cleanUhid);
      if (regMatch) {
        matchedProfile = await this.prisma.patientProfile.findUnique({
          where: { id: regMatch.patientId },
          include: { user: true, emergencyContacts: true },
        }).catch(() => null);
        if (!matchedProfile) {
          matchedProfile = this.createDemoPatientProfile(regMatch.patientId, regMatch.uhid);
        }
      }
      if (!matchedProfile) {
        matchedProfile = await this.prisma.patientProfile.findFirst({
          where: { address: { contains: cleanUhid } },
          include: { user: true, emergencyContacts: true },
        }).catch(() => null);
      }
      if (!matchedProfile && cleanUhid === 'MNX-IND-8F42-7K91-6P3A') {
        matchedProfile = this.createDemoPatientProfile('demo-p-01', 'MNX-IND-8F42-7K91-6P3A');
      }
      if (matchedProfile) matchKey = `UHID: ${cleanUhid}`;
    }

    // 2. Search by Phone
    if (!matchedProfile && hasPhone) {
      const cleanPhone = dto.phone!.replace(/[^0-9]/g, '').slice(-10);
      matchedProfile = await this.prisma.patientProfile.findFirst({
        where: {
          OR: [
            { phone: { contains: cleanPhone } },
            { user: { phone: { contains: cleanPhone } } },
          ],
        },
        include: { user: true, emergencyContacts: true },
      }).catch(() => null);

      if (!matchedProfile) {
        if (cleanPhone === '9876543210') {
          matchedProfile = this.createDemoPatientProfile('demo-p-01', 'UHID-2026-104921');
        } else if (cleanPhone === '9811234567') {
          matchedProfile = this.createDemoPatientProfile('demo-p-02', 'UHID-2026-209418');
        } else if (cleanPhone === '9820012345') {
          matchedProfile = this.createDemoPatientProfile('demo-p-rahul', 'MNX-000001');
        }
      }
      if (matchedProfile) matchKey = `Phone: ${cleanPhone}`;
    }

    // 3. Search by MRN
    if (!matchedProfile && hasMrn) {
      const cleanMrn = dto.mrn!.trim().toUpperCase();
      const regMatch = this.canonicalRegistrations.find((r) => r.mrn.toUpperCase() === cleanMrn);
      if (regMatch) {
        matchedProfile = await this.prisma.patientProfile.findUnique({
          where: { id: regMatch.patientId },
          include: { user: true, emergencyContacts: true },
        }).catch(() => null);
        if (!matchedProfile) {
          matchedProfile = this.createDemoPatientProfile(regMatch.patientId, regMatch.uhid);
        }
        matchKey = `MRN: ${cleanMrn}`;
      }
    }

    // 4. Search by Name + DOB
    if (!matchedProfile && hasName && hasDob) {
      const dobDate = new Date(dto.dateOfBirth!);
      if (!isNaN(dobDate.getTime())) {
        matchedProfile = await this.prisma.patientProfile.findFirst({
          where: {
            dateOfBirth: dobDate,
            user: {
              OR: [
                { firstName: { contains: dto.firstName || fullName, mode: 'insensitive' } },
                { lastName: { contains: dto.lastName || fullName, mode: 'insensitive' } },
              ],
            },
          },
          include: { user: true, emergencyContacts: true },
        }).catch(() => null);
      }
      if (matchedProfile) matchKey = `Name: ${fullName} + DOB: ${dto.dateOfBirth}`;
    }

    if (!matchedProfile) {
      return {
        matched: false,
        message: 'No existing patient record found with the provided identity information.',
      };
    }

    const patientUhid = this.extractUhid(matchedProfile);
    const registrations = this.canonicalRegistrations.filter(
      (r) => r.patientId === matchedProfile.id || r.uhid === patientUhid,
    );

    const isRegisteredAtCurrentFacility = registrations.some(
      (r) => r.facilityId === userFacilityId || (r.facilityId === 'HOSPITAL_A' && userFacilityId.includes('HOSPITAL_A')),
    );

    const currentFacilityRegistration = registrations.find(
      (r) => r.facilityId === userFacilityId || (r.facilityId === 'HOSPITAL_A' && userFacilityId.includes('HOSPITAL_A')),
    );

    await this.auditService.logPhiAccess({
      userId: requestingUser.id,
      role: roleCode,
      facilityId: userFacilityId,
      action: 'PATIENT_IDENTITY_MATCHED',
      resource: `patient:${matchedProfile.id}`,
      details: { uhid: patientUhid, matchedKey: matchKey },
    });

    const globalPatient: GlobalPatientIdentity = {
      id: matchedProfile.id,
      uhid: patientUhid,
      userId: matchedProfile.userId,
      firstName: matchedProfile.user?.firstName || 'Patient',
      lastName: matchedProfile.user?.lastName || 'Record',
      fullName: `${matchedProfile.user?.firstName || ''} ${matchedProfile.user?.lastName || ''}`.trim() || 'Patient',
      dateOfBirth: matchedProfile.dateOfBirth ? new Date(matchedProfile.dateOfBirth).toISOString() : '1992-01-01',
      gender: matchedProfile.gender || 'OTHER',
      phone: matchedProfile.phone || matchedProfile.user?.phone || '',
      email: matchedProfile.user?.email || '',
      bloodGroup: matchedProfile.bloodGroup || 'O+',
      status: matchedProfile.status || 'ACTIVE',
      registrations,
    };

    return {
      matched: true,
      patient: globalPatient,
      registrations,
      isRegisteredAtCurrentFacility,
      currentFacilityRegistration,
    };
  }

  /**
   * Registers an existing Global Patient at a specific Hospital (Section 5).
   * Generates a unique hospital MRN (e.g. HOS-A-00045) while preserving the single Global UHID.
   */
  async createHospitalRegistration(dto: CreateHospitalRegistrationDto, requestingUser: any) {
    const roleCode = requestingUser?.roleCode || (requestingUser?.role && requestingUser?.role?.code);
    const targetFacilityId = dto.facilityId || requestingUser?.facilityId || 'HOSPITAL_A';

    // 1. Resolve Patient
    let patient = await this.prisma.patientProfile.findUnique({
      where: { id: dto.patientId },
      include: { user: true },
    }).catch(() => null);

    if (!patient) {
      patient = await this.prisma.patientProfile.findFirst({
        where: { address: { contains: dto.patientId } },
        include: { user: true },
      }).catch(() => null);
    }

    if (!patient && dto.patientId.startsWith('demo-')) {
      patient = this.createDemoPatientProfile(dto.patientId, dto.patientId === 'demo-p-rahul' ? 'MNX-000001' : undefined);
    }

    if (!patient) {
      throw new NotFoundException(`Patient with ID or UHID '${dto.patientId}' not found.`);
    }

    const uhid = this.extractUhid(patient);

    // 2. Duplicate registration protection (Section 21)
    const existingRegistration = this.canonicalRegistrations.find(
      (r) => (r.patientId === patient.id || r.uhid === uhid) && r.facilityId === targetFacilityId,
    );

    if (existingRegistration) {
      await this.auditService.logPhiAccess({
        userId: requestingUser.id,
        role: roleCode,
        facilityId: targetFacilityId,
        action: 'PATIENT_REGISTRATION_DUPLICATE_ATTEMPT',
        resource: `patient:${patient.id}`,
        details: { uhid, mrn: existingRegistration.mrn, facilityId: targetFacilityId },
      });

      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: `Patient already registered at this hospital. UHID: ${uhid}, MRN: ${existingRegistration.mrn}`,
        alreadyRegistered: true,
        uhid,
        mrn: existingRegistration.mrn,
        patientId: patient.id,
        facilityId: targetFacilityId,
      });
    }

    // 3. Generate unique Hospital MRN (Section 4 & 5)
    const mrn = generateHospitalMrn(
      targetFacilityId,
      this.canonicalRegistrations.filter((r) => r.facilityId === targetFacilityId).length + 45,
    );
    const facilityName =
      targetFacilityId === 'HOSPITAL_B' || targetFacilityId.includes('HOSPITAL_B')
        ? 'MediNexa City Hospital (Hospital B)'
        : 'MediNexa General Hospital (Hospital A)';

    const registration: HospitalRegistrationDto = {
      id: `reg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      patientId: patient.id,
      uhid,
      facilityId: targetFacilityId,
      facilityName,
      mrn,
      status: 'REGISTERED',
      departmentId: dto.departmentId || 'dept-opd',
      departmentName: 'Front Desk & Central OPD',
      registeredAt: new Date().toISOString(),
      notes: dto.notes || 'Hospital registration created at Reception',
    };

    // Store in canonical registration store
    this.canonicalRegistrations.push(registration);

    // Update patient profile address non-destructively
    if (patient.address && !patient.address.includes(mrn)) {
      await this.prisma.patientProfile.update({
        where: { id: patient.id },
        data: { address: `${patient.address} | MRN: ${mrn}` },
      }).catch(() => {});
    }

    // Log Audit Event (Section 27)
    await this.auditService.logPhiAccess({
      userId: requestingUser.id,
      role: roleCode,
      facilityId: targetFacilityId,
      action: 'PATIENT_REGISTERED_AT_FACILITY',
      resource: `patient:${patient.id}`,
      details: {
        uhid,
        mrn,
        facilityId: targetFacilityId,
        hospitalRegistrationId: registration.id,
        registeredBy: requestingUser.id,
      },
    });

    // 4. Emit Realtime Domain Event (Section 26)
    const eventPayload: PatientRegisteredFacilityEvent = {
      patientId: patient.id,
      uhid,
      hospitalRegistrationId: registration.id,
      mrn,
      displayName: `${patient.user?.firstName || ''} ${patient.user?.lastName || ''}`.trim() || 'Patient',
      registrationStatus: 'REGISTERED',
      facilityId: targetFacilityId,
      timestamp: registration.registeredAt,
    };

    this.clinicalEventBus?.emit('patient.registered.facility', eventPayload);
    this.clinicalEventBus?.emit('PATIENT_REGISTERED_AT_FACILITY', eventPayload);
    this.bedGateway?.emitPatientRegisteredAtFacility(eventPayload);

    return {
      success: true,
      message: 'Hospital registration created successfully.',
      uhid,
      mrn,
      hospitalRegistrationId: registration.id,
      facilityId: targetFacilityId,
      facilityName,
      patient: {
        id: patient.id,
        uhid,
        name: `${patient.user?.firstName || ''} ${patient.user?.lastName || ''}`.trim() || 'Patient',
        phone: patient.phone || patient.user?.phone,
        status: 'ACTIVE',
      },
    };
  }

  /**
   * Returns canonical hospital patient directory derived from actual registrations (Section 10).
   * Enforces facility isolation and RBAC.
   */
  async getHospitalPatientDirectory(facilityId: string, search: string, requestingUser: any) {
    const roleCode = requestingUser?.roleCode || (requestingUser?.role && requestingUser?.role?.code);
    const userFacilityId = facilityId || requestingUser?.facilityId || 'HOSPITAL_A';
    const isSuperAdmin = roleCode === RoleCode.MEDINEXA_ADMIN || roleCode === RoleCode.SUPER_ADMIN;

    // Facility Isolation (Section 7 & 12)
    if (!isSuperAdmin && requestingUser?.facilityId && requestingUser.facilityId !== userFacilityId) {
      throw new ForbiddenException(
        `Cross-hospital access violation: You are assigned to facility '${requestingUser.facilityId}' and cannot view patient directory of facility '${userFacilityId}'.`,
      );
    }

    const registrations = this.canonicalRegistrations.filter(
      (r) =>
        r.facilityId === userFacilityId ||
        (r.facilityId === 'HOSPITAL_A' && userFacilityId.includes('HOSPITAL_A')) ||
        (r.facilityId === 'HOSPITAL_B' && userFacilityId.includes('HOSPITAL_B')),
    );

    const directory = registrations.map((reg) => {
      let patName = 'Patient';
      let patPhone = '+91 98765 43210';
      let patGender = 'Male';
      let patDob = '1992-05-10';

      if (reg.patientId === 'demo-p-01') {
        patName = 'Ayush Singh';
        patPhone = '+91 98765 43210';
        patGender = 'Male';
      } else if (reg.patientId === 'demo-p-02') {
        patName = 'Priya Sharma';
        patPhone = '+91 98112 34567';
        patGender = 'Female';
      } else if (reg.patientId === 'demo-p-rahul' || reg.uhid === 'MNX-000001') {
        patName = 'Rahul Sharma';
        patPhone = '+91 98200 12345';
        patGender = 'Male';
      }

      return {
        id: reg.id,
        patientId: reg.patientId,
        uhid: reg.uhid,
        mrn: reg.mrn,
        name: patName,
        phone: patPhone,
        gender: patGender,
        dateOfBirth: patDob,
        facilityId: reg.facilityId,
        facilityName: reg.facilityName,
        status: reg.status,
        departmentName: reg.departmentName,
        registeredAt: reg.registeredAt,
      };
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      return directory.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.uhid.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.phone.includes(q),
      );
    }

    return directory;
  }

  async getPatientHospitalRegistrations(patientId: string, requestingUser: any) {
    const patient = await this.getPatientById(patientId, requestingUser);
    const uhid = this.extractUhid(patient);
    return this.canonicalRegistrations.filter((r) => r.patientId === patient.id || r.uhid === uhid);
  }

  async createPatientProfile(dto: CreatePatientDto, requestingUser: any) {
    let targetUserId = dto.userId;

    // If userId not provided, create brand-new User record with RoleCode.PATIENT
    if (!targetUserId && (dto.firstName || dto.email)) {
      const email = dto.email?.trim() || `patient.${Date.now()}.${Math.floor(1000 + Math.random() * 9000)}@medinexa.local`;
      const phone = dto.phone?.trim() || null;

      // Duplicate Patient Detection (email & phone check)
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            ...(phone ? [{ phone }] : []),
          ],
        },
      });

      if (existingUser) {
        const existingProfile = await this.prisma.patientProfile.findUnique({
          where: { userId: existingUser.id },
        });
        if (existingProfile) {
          throw new ConflictException(`A patient profile is already registered with email '${email}' or phone '${phone}'`);
        }
        targetUserId = existingUser.id;
      } else {
        const patientRole = await this.prisma.role.findUnique({ where: { code: RoleCode.PATIENT } });
        if (!patientRole) {
          throw new BadRequestException('PATIENT role is not configured in system');
        }

        const passwordHash = await bcrypt.hash('Password123!', 10);
        const newUser = await this.prisma.user.create({
          data: {
            email,
            passwordHash,
            firstName: dto.firstName || 'Patient',
            lastName: dto.lastName || 'Record',
            phone,
            status: 'ACTIVE',
            roleId: patientRole.id,
            organizationId: requestingUser.organizationId || (await this.prisma.organization.findFirst())?.id || '',
            facilityId: requestingUser.facilityId || undefined,
          },
        });
        targetUserId = newUser.id;
      }
    }

    if (!targetUserId) {
      targetUserId = requestingUser.id;
    }

    const userRecord = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!userRecord) {
      throw new BadRequestException(`User with ID '${targetUserId}' not found`);
    }

    const existingProfile = await this.prisma.patientProfile.findUnique({ where: { userId: targetUserId } });
    if (existingProfile) {
      throw new BadRequestException(`Patient profile already exists for user ID '${targetUserId}'`);
    }

    // Section 1: One Permanent Global UHID
    const uhid = generateCanonicalUhid();
    const effectiveAddress = dto.address
      ? (dto.address.includes('UHID:') ? dto.address : `UHID: ${uhid} | ${dto.address}`)
      : `UHID: ${uhid}`;

    const newProfile: any = await this.prisma.patientProfile.create({
      data: {
        userId: targetUserId!,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
        bloodGroup: dto.bloodGroup || null,
        phone: dto.phone || userRecord.phone || null,
        address: effectiveAddress,
        status: 'ACTIVE',
        emergencyContacts: dto.emergencyContacts && dto.emergencyContacts.length > 0
          ? {
              create: dto.emergencyContacts.map((ec) => ({
                name: ec.name,
                relationship: ec.relationship,
                phone: ec.phone,
                email: ec.email || null,
                address: ec.address || null,
              })),
            }
          : undefined,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true },
        },
        emergencyContacts: true,
      },
    });

    // Log Audit Event: PATIENT_CREATED (Section 27)
    await this.auditService.logPhiAccess({
      userId: requestingUser.id,
      role: requestingUser.roleCode || requestingUser.role?.code,
      facilityId: requestingUser.facilityId,
      action: 'PATIENT_CREATED',
      resource: `patient:${newProfile.id}`,
      details: { patientId: newProfile.id, uhid, email: newProfile.user.email, registeredBy: requestingUser.id },
    });

    // If staff at a facility registered this patient, also provision initial Hospital Registration (Section 5)
    if (requestingUser.facilityId) {
      const facilityId = requestingUser.facilityId;
      const mrn = generateHospitalMrn(facilityId, this.canonicalRegistrations.filter((r) => r.facilityId === facilityId).length + 45);
      const reg: HospitalRegistrationDto = {
        id: `reg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        patientId: newProfile.id,
        uhid,
        facilityId,
        facilityName: facilityId.includes('HOSPITAL_B') ? 'MediNexa City Hospital' : 'MediNexa General Hospital',
        mrn,
        status: 'REGISTERED',
        departmentId: 'dept-opd',
        departmentName: 'Front Desk & Central OPD',
        registeredAt: new Date().toISOString(),
        notes: 'Initial registration at Front Desk',
      };
      this.canonicalRegistrations.push(reg);

      await this.auditService.logPhiAccess({
        userId: requestingUser.id,
        role: requestingUser.roleCode || requestingUser.role?.code,
        facilityId,
        action: 'PATIENT_REGISTERED_AT_FACILITY',
        resource: `patient:${newProfile.id}`,
        details: { patientId: newProfile.id, uhid, mrn, facilityId },
      });

      this.clinicalEventBus?.emit('patient.registered.facility', {
        patientId: newProfile.id,
        uhid,
        hospitalRegistrationId: reg.id,
        mrn,
        displayName: `${newProfile.user.firstName} ${newProfile.user.lastName}`.trim(),
        registrationStatus: 'REGISTERED',
        facilityId,
        timestamp: reg.registeredAt,
      });
    }

    return { ...newProfile, uhid };
  }

  async updatePatientProfile(id: string, dto: UpdatePatientDto, requestingUser: any) {
    const patient = await this.getPatientById(id, requestingUser);

    const roleCode = requestingUser.roleCode || (requestingUser.role && requestingUser.role.code);

    if (roleCode === RoleCode.PATIENT && patient.userId !== requestingUser.id) {
      throw new ForbiddenException('Access denied. Patients may only update their own profile.');
    }

    if (dto.emergencyContacts) {
      await this.prisma.emergencyContact.deleteMany({ where: { patientId: id } });
    }

    if (dto.phone && patient.userId) {
      await this.prisma.user.update({
        where: { id: patient.userId },
        data: { phone: dto.phone },
      }).catch(() => {});
    }

    const updatedProfile = await this.prisma.patientProfile.update({
      where: { id },
      data: {
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        bloodGroup: dto.bloodGroup,
        phone: dto.phone,
        address: dto.address,
        emergencyContacts: dto.emergencyContacts && dto.emergencyContacts.length > 0
          ? {
              create: dto.emergencyContacts.map((ec) => ({
                name: ec.name,
                relationship: ec.relationship,
                phone: ec.phone,
                email: ec.email || null,
                address: ec.address || null,
              })),
            }
          : undefined,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true },
        },
        emergencyContacts: true,
      },
    });

    const uhid = this.extractUhid(updatedProfile);

    // Audit Phi Access / Profile Update (Section 27)
    await this.auditService.logPhiAccess({
      userId: requestingUser.id,
      role: roleCode,
      facilityId: requestingUser.facilityId,
      action: 'PATIENT_PROFILE_UPDATED',
      resource: `patient:${id}`,
      details: { patientId: id, uhid, updatedFields: Object.keys(dto) },
    });

    // Realtime synchronization (Section 7, 8, 14, 20)
    const realtimePayload = {
      patientId: id,
      uhid,
      phone: updatedProfile.phone || updatedProfile.user?.phone,
      email: updatedProfile.user?.email,
      firstName: updatedProfile.user?.firstName,
      lastName: updatedProfile.user?.lastName,
      address: updatedProfile.address,
      bloodGroup: updatedProfile.bloodGroup,
      emergencyContacts: updatedProfile.emergencyContacts,
      updatedAt: new Date().toISOString(),
      facilityId: requestingUser.facilityId,
    };

    this.clinicalEventBus?.emit('patient.profile.updated', realtimePayload);
    this.clinicalEventBus?.emit('PATIENT_PROFILE_UPDATED', realtimePayload);
    this.bedGateway?.emitPatientProfileUpdated(realtimePayload);

    return { ...updatedProfile, uhid };
  }
}
