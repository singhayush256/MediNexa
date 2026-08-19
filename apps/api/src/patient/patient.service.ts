import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { RoleCode } from '@medinexa/types';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async getPatients(requestingUser: any) {
    const roleCode = requestingUser.roleCode || (requestingUser.role && requestingUser.role.code);

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

    return this.prisma.patientProfile.findMany({
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
    const targetUserId = dto.userId || requestingUser.id;

    // Check if target user exists
    const userRecord = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!userRecord) {
      throw new BadRequestException(`User with ID '${targetUserId}' not found`);
    }

    // Check profile uniqueness
    const existingProfile = await this.prisma.patientProfile.findUnique({ where: { userId: targetUserId } });
    if (existingProfile) {
      throw new BadRequestException(`Patient profile already exists for user ID '${targetUserId}'`);
    }

    // Create profile with optional emergency contacts
    return this.prisma.patientProfile.create({
      data: {
        userId: targetUserId,
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
