import { Injectable, BadRequestException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { RoleCode } from '@medinexa/types';

@Injectable()
export class PatientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getPatients(requestingUser: any) {
    const roleCode = requestingUser?.roleCode || (requestingUser?.role && requestingUser?.role?.code) || requestingUser?.role;
    const userFacilityId = requestingUser?.facilityId || requestingUser?.doctorProfile?.facilityId || requestingUser?.facility?.id;

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

    const where: any = {};
    if (roleCode !== RoleCode.MEDINEXA_ADMIN && userFacilityId) {
      where.OR = [
        { user: { facilityId: userFacilityId } },
        { user: { facilityId: null } },
        { admissions: { some: { facilityId: userFacilityId } } },
        { appointments: { some: { facilityId: userFacilityId } } },
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
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true },
        },
        emergencyContacts: true,
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient profile with ID '${id}' not found`);
    }

    const roleCode = requestingUser.roleCode || (requestingUser.role && requestingUser.role.code);

    // Security check: PATIENT users can ONLY view their own profile
    if (roleCode === RoleCode.PATIENT && patient.userId !== requestingUser.id) {
      throw new ForbiddenException('Access denied. Patients may only view their own profile.');
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
      }),
      this.prisma.diagnosis.findMany({
        where: { patientId: id },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.prescription.findMany({
        where: { patientId: id },
        include: {
          doctor: { select: { user: { select: { firstName: true, lastName: true } } } },
          items: { include: { medication: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.medicationReminder.findMany({
        where: { patientId: id },
        include: {
          prescriptionItem: { include: { medication: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.clinicalEncounter.findMany({
        where: { patientId: id },
        include: {
          doctor: { select: { user: { select: { firstName: true, lastName: true } } } },
          facility: { select: { name: true } },
          department: { select: { name: true } },
          clinicalNotes: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.labOrder.findMany({
        where: { patientId: id },
        include: {
          items: { include: { labTest: true } },
          doctor: { select: { user: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    await this.auditService.logPhiAccess({
      userId: requestingUser.id,
      role: roleCode,
      facilityId: requestingUser.facilityId,
      action: 'VIEW_PATIENT_360',
      resource: `patient:${id}`,
      details: { patientId: id, totalVitals: vitals.length, totalDiagnoses: diagnoses.length },
    });

    return {
      patient,
      vitals,
      diagnoses,
      prescriptions,
      medicationReminders,
      encounters,
      labOrders,
    };
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

    const newProfile: any = await this.prisma.patientProfile.create({
      data: {
        userId: targetUserId!,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
        bloodGroup: dto.bloodGroup || null,
        phone: dto.phone || userRecord.phone || null,
        address: dto.address || null,
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

    await this.auditService.logPhiAccess({
      userId: requestingUser.id,
      role: requestingUser.roleCode || requestingUser.role?.code,
      facilityId: requestingUser.facilityId,
      action: 'REGISTER_NEW_PATIENT',
      resource: `patient:${newProfile.id}`,
      details: { patientId: newProfile.id, email: newProfile.user.email, registeredBy: requestingUser.id },
    });

    return newProfile;
  }

  async updatePatientProfile(id: string, dto: UpdatePatientDto, requestingUser: any) {
    const patient = await this.getPatientById(id, requestingUser);

    const roleCode = requestingUser.roleCode || (requestingUser.role && requestingUser.role.code);

    // Security check: PATIENT users can ONLY update their own profile
    if (roleCode === RoleCode.PATIENT && patient.userId !== requestingUser.id) {
      throw new ForbiddenException('Access denied. Patients may only update their own profile.');
    }

    // If emergency contacts provided, recreate them safely
    if (dto.emergencyContacts) {
      await this.prisma.emergencyContact.deleteMany({ where: { patientId: id } });
    }

    return this.prisma.patientProfile.update({
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
  }
}
