import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleCode, BedStatus, AppointmentStatus, EmergencyStatus, ReferralStatus } from '@medinexa/types';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverviewAnalytics(requestingUser: any) {
    if (requestingUser.role === RoleCode.PATIENT) {
      const patientId = requestingUser.patientProfile?.id;
      if (!patientId) return { role: 'PATIENT', appointments: 0, prescriptions: 0, labResults: 0 };

      const [appts, rxs, labs, reminders] = await Promise.all([
        this.prisma.appointment.count({ where: { patientId } }),
        this.prisma.prescription.count({ where: { patientId } }),
        this.prisma.labResult.count({ where: { patientId } }),
        this.prisma.medicationReminder.count({ where: { patientId, status: 'ACTIVE' } }),
      ]);

      return {
        role: 'PATIENT',
        totalAppointments: appts,
        totalPrescriptions: rxs,
        totalLabResults: labs,
        activeReminders: reminders,
      };
    }

    if (requestingUser.role === RoleCode.DOCTOR) {
      const doctorId = requestingUser.doctorProfile?.id;
      if (!doctorId) return { role: 'DOCTOR', todayAppointments: 0 };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [todayAppts, pendingLabs, activeEncounters] = await Promise.all([
        this.prisma.appointment.count({
          where: { doctorId, appointmentDate: { gte: today, lt: tomorrow } },
        }),
        this.prisma.labOrder.count({ where: { doctorId, status: 'ORDERED' } }),
        this.prisma.clinicalEncounter.count({ where: { doctorId, status: 'IN_PROGRESS' } }),
      ]);

      return {
        role: 'DOCTOR',
        todayAppointments: todayAppts,
        pendingLabOrders: pendingLabs,
        activeEncounters: activeEncounters,
      };
    }

    // HOSPITAL_ADMIN & MEDINEXA_ADMIN
    const facilityId = requestingUser.role === RoleCode.HOSPITAL_ADMIN ? requestingUser.facilityId : undefined;

    return this.getFacilityAnalytics(facilityId, requestingUser);
  }

  async getFacilityAnalytics(facilityId: string | undefined, requestingUser: any) {
    // Isolation Check: Hospital Admin cannot access another facility
    if (requestingUser.role === RoleCode.HOSPITAL_ADMIN) {
      if (facilityId && facilityId !== requestingUser.facilityId) {
        throw new ForbiddenException('Hospital administrators can only access their own facility analytics');
      }
      facilityId = requestingUser.facilityId;
    }

    const facilityFilter = facilityId ? { facilityId } : {};

    const [
      totalPatients,
      totalDoctors,
      totalBeds,
      occupiedBeds,
      availableBeds,
      reservedBeds,
      activeAdmissions,
      activeEmergencies,
      availableAmbulances,
      pendingReferrals,
    ] = await Promise.all([
      this.prisma.patientProfile.count(),
      this.prisma.doctorProfile.count({ where: facilityFilter }),
      this.prisma.bed.count({ where: facilityFilter }),
      this.prisma.bed.count({ where: { ...facilityFilter, status: BedStatus.OCCUPIED } }),
      this.prisma.bed.count({ where: { ...facilityFilter, status: BedStatus.AVAILABLE } }),
      this.prisma.bed.count({ where: { ...facilityFilter, status: BedStatus.RESERVED } }),
      this.prisma.admission.count({ where: { ...facilityFilter, status: 'ADMITTED' } }),
      this.prisma.emergencyRequest.count({
        where: facilityId
          ? { sourceFacilityId: facilityId, status: { notIn: ['CLOSED', 'CANCELLED'] } }
          : { status: { notIn: ['CLOSED', 'CANCELLED'] } },
      }),
      this.prisma.ambulance.count({ where: { ...facilityFilter, status: 'AVAILABLE' } }),
      this.prisma.hospitalReferral.count({
        where: facilityId
          ? { destinationFacilityId: facilityId, status: ReferralStatus.REQUESTED }
          : { status: ReferralStatus.REQUESTED },
      }),
    ]);

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      scope: facilityId ? 'FACILITY' : 'NETWORK',
      facilityId,
      patients: { total: totalPatients },
      doctors: { total: totalDoctors },
      beds: {
        total: totalBeds,
        occupied: occupiedBeds,
        available: availableBeds,
        reserved: reservedBeds,
        occupancyRatePercentage: occupancyRate,
      },
      admissions: { active: activeAdmissions },
      emergencies: { active: activeEmergencies },
      ambulances: { available: availableAmbulances },
      referrals: { pending: pendingReferrals },
    };
  }

  async getAppointmentAnalytics(requestingUser: any) {
    const facilityFilter = requestingUser.role === RoleCode.HOSPITAL_ADMIN ? { facilityId: requestingUser.facilityId } : {};

    const [requested, confirmed, checkedIn, inProgress, completed, cancelled] = await Promise.all([
      this.prisma.appointment.count({ where: { ...facilityFilter, status: AppointmentStatus.REQUESTED } }),
      this.prisma.appointment.count({ where: { ...facilityFilter, status: AppointmentStatus.CONFIRMED } }),
      this.prisma.appointment.count({ where: { ...facilityFilter, status: AppointmentStatus.CHECKED_IN } }),
      this.prisma.appointment.count({ where: { ...facilityFilter, status: AppointmentStatus.IN_PROGRESS } }),
      this.prisma.appointment.count({ where: { ...facilityFilter, status: AppointmentStatus.COMPLETED } }),
      this.prisma.appointment.count({ where: { ...facilityFilter, status: AppointmentStatus.CANCELLED } }),
    ]);

    return {
      requested,
      confirmed,
      checkedIn,
      inProgress,
      completed,
      cancelled,
      total: requested + confirmed + checkedIn + inProgress + completed + cancelled,
    };
  }

  async getBedAnalytics(requestingUser: any) {
    const facilityFilter = requestingUser.role === RoleCode.HOSPITAL_ADMIN ? { facilityId: requestingUser.facilityId } : {};

    const bedsByStatus = await this.prisma.bed.groupBy({
      by: ['status'],
      where: facilityFilter,
      _count: { status: true },
    });

    const statusCounts = bedsByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {} as Record<string, number>);

    return {
      available: statusCounts['AVAILABLE'] || 0,
      occupied: statusCounts['OCCUPIED'] || 0,
      reserved: statusCounts['RESERVED'] || 0,
      cleaning: statusCounts['CLEANING'] || 0,
      maintenance: statusCounts['MAINTENANCE'] || 0,
      outOfService: statusCounts['OUT_OF_SERVICE'] || 0,
    };
  }
}
