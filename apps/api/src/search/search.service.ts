import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleCode } from '@medinexa/types';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string, category: string | undefined, requestingUser: any) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters');
    }

    const q = query.trim();
    const results: Record<string, any[]> = {
      patients: [],
      doctors: [],
      facilities: [],
      departments: [],
      appointments: [],
      admissions: [],
      referrals: [],
    };

    const facilityFilter = requestingUser.role === RoleCode.HOSPITAL_ADMIN ? { facilityId: requestingUser.facilityId } : {};

    // 1. Search Patients (Doctors, Nurses, Admins)
    if (!category || category === 'patients') {
      if (requestingUser.role !== RoleCode.PATIENT) {
        results.patients = await this.prisma.patientProfile.findMany({
          where: {
            OR: [
              { user: { firstName: { contains: q, mode: 'insensitive' } } },
              { user: { lastName: { contains: q, mode: 'insensitive' } } },
              { user: { email: { contains: q, mode: 'insensitive' } } },
              { phone: { contains: q, mode: 'insensitive' } },
            ],
          },
          include: { user: true },
          take: 10,
        });
      }
    }

    // 2. Search Doctors (Public / All)
    if (!category || category === 'doctors') {
      results.doctors = await this.prisma.doctorProfile.findMany({
        where: {
          ...facilityFilter,
          OR: [
            { user: { firstName: { contains: q, mode: 'insensitive' } } },
            { user: { lastName: { contains: q, mode: 'insensitive' } } },
            { specialty: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        include: { user: true, facility: true, department: true, specialty: true },
        take: 10,
      });
    }

    // 3. Search Facilities & Departments
    if (!category || category === 'facilities') {
      results.facilities = await this.prisma.facility.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });
    }

    if (!category || category === 'departments') {
      results.departments = await this.prisma.department.findMany({
        where: {
          ...facilityFilter,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { facility: true },
        take: 10,
      });
    }

    // 4. Search Appointments
    if (!category || category === 'appointments') {
      const apptWhere: any = {
        ...facilityFilter,
        OR: [
          { appointmentNumber: { contains: q, mode: 'insensitive' } },
          { reason: { contains: q, mode: 'insensitive' } },
        ],
      };

      if (requestingUser.role === RoleCode.PATIENT) {
        apptWhere.patientId = requestingUser.patientProfile?.id;
      } else if (requestingUser.role === RoleCode.DOCTOR) {
        apptWhere.doctorId = requestingUser.doctorProfile?.id;
      }

      results.appointments = await this.prisma.appointment.findMany({
        where: apptWhere,
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true } },
          facility: true,
        },
        take: 10,
      });
    }

    // 5. Search Referrals
    if (!category || category === 'referrals') {
      if (requestingUser.role !== RoleCode.PATIENT) {
        const refWhere: any = {
          OR: [
            { referralNumber: { contains: q, mode: 'insensitive' } },
            { reason: { contains: q, mode: 'insensitive' } },
          ],
        };

        if (requestingUser.role === RoleCode.HOSPITAL_ADMIN) {
          refWhere.OR = [
            { sourceFacilityId: requestingUser.facilityId },
            { destinationFacilityId: requestingUser.facilityId },
          ];
        }

        results.referrals = await this.prisma.hospitalReferral.findMany({
          where: refWhere,
          include: { sourceFacility: true, destinationFacility: true },
          take: 10,
        });
      }
    }

    return results;
  }
}
