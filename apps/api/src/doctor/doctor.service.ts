import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { RoleCode } from '@medinexa/types';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  async getSpecialties() {
    return this.prisma.specialty.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getDoctors(filters: { facilityId?: string; departmentId?: string; specialtyId?: string }) {
    const where: any = {};
    if (filters.facilityId) where.facilityId = filters.facilityId;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.specialtyId) where.specialtyId = filters.specialtyId;

    return this.prisma.doctorProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true },
        },
        facility: {
          select: { id: true, name: true, code: true, address: true, city: true, state: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
        specialty: {
          select: { id: true, name: true, code: true, description: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDoctorById(id: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true },
        },
        facility: true,
        department: true,
        specialty: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor profile with ID '${id}' not found`);
    }

    return doctor;
  }

  async getDoctorByUserId(userId: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true },
        },
        facility: true,
        department: true,
        specialty: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException(`No doctor profile found for user ID '${userId}'`);
    }

    return doctor;
  }

  async createDoctorProfile(dto: CreateDoctorDto) {
    // 1. Verify User existence & role
    const userRecord = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: { role: true },
    });

    if (!userRecord) {
      throw new BadRequestException(`User with ID '${dto.userId}' not found`);
    }

    // 2. Check profile uniqueness
    const existingProfile = await this.prisma.doctorProfile.findUnique({ where: { userId: dto.userId } });
    if (existingProfile) {
      throw new BadRequestException(`Doctor profile already exists for user ID '${dto.userId}'`);
    }

    // 3. Verify Facility existence
    const facilityRecord = await this.prisma.facility.findUnique({ where: { id: dto.facilityId } });
    if (!facilityRecord) {
      throw new BadRequestException(`Facility with ID '${dto.facilityId}' not found`);
    }

    // 4. Verify Department existence & facility relationship integrity
    const departmentRecord = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
    if (!departmentRecord) {
      throw new BadRequestException(`Department with ID '${dto.departmentId}' not found`);
    }

    if (departmentRecord.facilityId !== dto.facilityId) {
      throw new BadRequestException(
        `Department '${departmentRecord.name}' does not belong to facility '${facilityRecord.name}'`,
      );
    }

    // 5. Verify Specialty existence
    const specialtyRecord = await this.prisma.specialty.findUnique({ where: { id: dto.specialtyId } });
    if (!specialtyRecord) {
      throw new BadRequestException(`Specialty with ID '${dto.specialtyId}' not found`);
    }

    // 6. Check license number uniqueness
    const existingLicense = await this.prisma.doctorProfile.findUnique({
      where: { licenseNumber: dto.licenseNumber },
    });
    if (existingLicense) {
      throw new BadRequestException(`License number '${dto.licenseNumber}' is already registered`);
    }

    return this.prisma.doctorProfile.create({
      data: {
        userId: dto.userId,
        facilityId: dto.facilityId,
        departmentId: dto.departmentId,
        specialtyId: dto.specialtyId,
        licenseNumber: dto.licenseNumber,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true },
        },
        facility: true,
        department: true,
        specialty: true,
      },
    });
  }

  async updateDoctorProfile(id: string, dto: UpdateDoctorDto, requestingUser: any) {
    const doctor = await this.getDoctorById(id);

    const roleCode = requestingUser.roleCode || (requestingUser.role && requestingUser.role.code);

    // Security check: DOCTOR users can only update their own profile fields
    if (roleCode === RoleCode.DOCTOR && doctor.userId !== requestingUser.id) {
      throw new ForbiddenException('Access denied. Doctors may only update their own profile.');
    }

    if (dto.specialtyId) {
      const specialtyRecord = await this.prisma.specialty.findUnique({ where: { id: dto.specialtyId } });
      if (!specialtyRecord) {
        throw new BadRequestException(`Specialty with ID '${dto.specialtyId}' not found`);
      }
    }

    return this.prisma.doctorProfile.update({
      where: { id },
      data: {
        specialtyId: dto.specialtyId,
        licenseNumber: dto.licenseNumber,
        status: dto.status,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true },
        },
        facility: true,
        department: true,
        specialty: true,
      },
    });
  }
}
