import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WardService } from '../ward/ward.service';
import { AdmissionService } from '../admission/admission.service';
import { BedService } from '../bed/bed.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { AuthorizeRecordAccessDto } from './dto/authorize-record.dto';
import {
  ReferralStatus,
  ReferralUrgency,
  CrossFacilityTransferStatus,
  RecordAuthorizationStatus,
  RecordAuthorizationType,
  BedStatus,
  ReservationStatus,
  AssignmentStatus,
  AdmissionStatus,
  AdmissionType,
  RoleCode,
} from '@medinexa/types';

@Injectable()
export class ReferralService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wardService: WardService,
    private readonly admissionService: AdmissionService,
    private readonly bedService: BedService,
  ) {}

  private getUserRole(user: any): string {
    if (!user) return '';
    if (user.roleCode) return user.roleCode;
    if (typeof user.role === 'string') return user.role;
    if (user.role && user.role.code) return user.role.code;
    return '';
  }

  // =========================================================================
  // 1. HOSPITAL NETWORK CAPACITY SEARCH
  // =========================================================================

  async getNetworkFacilityCapacity(filters: { facilityId?: string; departmentId?: string }) {
    const facilities = await this.prisma.facility.findMany({
      where: filters.facilityId ? { id: filters.facilityId } : { status: 'ACTIVE' },
      select: { id: true, name: true, code: true },
    });

    const results = [];
    for (const fac of facilities) {
      const beds = await this.prisma.bed.findMany({
        where: {
          facilityId: fac.id,
          isActive: true,
          ...(filters.departmentId ? { ward: { departmentId: filters.departmentId } } : {}),
        },
      });

      const totalBeds = beds.length;
      const availableBeds = beds.filter((b) => b.status === BedStatus.AVAILABLE).length;
      const occupiedBeds = beds.filter((b) => b.status === BedStatus.OCCUPIED).length;
      const reservedBeds = beds.filter((b) => b.status === BedStatus.RESERVED).length;
      const cleaningBeds = beds.filter((b) => b.status === BedStatus.CLEANING).length;
      const maintenanceBeds = beds.filter((b) => b.status === BedStatus.MAINTENANCE).length;
      const outOfServiceBeds = beds.filter((b) => b.status === BedStatus.OUT_OF_SERVICE).length;
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      results.push({
        facilityId: fac.id,
        facilityName: fac.name,
        totalBeds,
        availableBeds,
        occupiedBeds,
        reservedBeds,
        cleaningBeds,
        maintenanceBeds,
        outOfServiceBeds,
        occupancyRate,
      });
    }

    return results;
  }

  async getNetworkAvailableBeds(filters: { facilityId?: string; departmentId?: string; bedType?: string }) {
    const where: any = {
      status: BedStatus.AVAILABLE,
      isActive: true,
    };
    if (filters.facilityId) where.facilityId = filters.facilityId;
    if (filters.bedType) where.bedType = filters.bedType;
    if (filters.departmentId) where.ward = { departmentId: filters.departmentId };

    return this.prisma.bed.findMany({
      where,
      include: {
        facility: { select: { name: true, code: true } },
        ward: { select: { id: true, name: true, code: true, departmentId: true } },
        room: { select: { roomNumber: true, roomType: true } },
      },
    });
  }

  // =========================================================================
  // 2. REFERRAL CREATION & MANAGEMENT
  // =========================================================================

  async createReferral(dto: CreateReferralDto, requestingUser: any) {
    let doctorId: string | null = null;

    if (requestingUser.doctorProfile?.id) {
      doctorId = requestingUser.doctorProfile.id;
    } else {
      const docProfile = await this.prisma.doctorProfile.findFirst({ where: { userId: requestingUser.id } });
      if (docProfile) {
        doctorId = docProfile.id;
      } else {
        // For administrative users without a doctor profile, associate a doctor from source facility
        const facilityDoc = await this.prisma.doctorProfile.findFirst({
          where: { facilityId: dto.sourceFacilityId },
        });
        if (facilityDoc) {
          doctorId = facilityDoc.id;
        } else {
          const anyDoc = await this.prisma.doctorProfile.findFirst();
          if (anyDoc) doctorId = anyDoc.id;
        }
      }
    }

    if (!doctorId) {
      throw new BadRequestException('A valid referring doctor profile is required to create a hospital referral');
    }

    const referralNumber = `REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const referral = await this.prisma.hospitalReferral.create({
      data: {
        referralNumber,
        patientId: dto.patientId,
        sourceFacilityId: dto.sourceFacilityId,
        destinationFacilityId: dto.destinationFacilityId,
        referringDoctorId: doctorId,
        admissionId: dto.admissionId || null,
        encounterId: dto.encounterId || null,
        reason: dto.reason,
        clinicalSummary: dto.clinicalSummary,
        urgency: dto.urgency || ReferralUrgency.ROUTINE,
        status: ReferralStatus.REQUESTED,
        requestedAt: new Date(),
      },
      include: {
        patient: { include: { user: true } },
        sourceFacility: { select: { name: true, code: true } },
        destinationFacility: { select: { name: true, code: true } },
        referringDoctor: { include: { user: true } },
      },
    });

    if (dto.destinationBedId) {
      await this.acceptReferral(referral.id, { destinationBedId: dto.destinationBedId }, requestingUser);
    }

    return this.getReferralById(referral.id);
  }

  async getReferrals(filters: { sourceFacilityId?: string; destinationFacilityId?: string; patientId?: string; status?: ReferralStatus }) {
    const where: any = {};
    if (filters.sourceFacilityId) where.sourceFacilityId = filters.sourceFacilityId;
    if (filters.destinationFacilityId) where.destinationFacilityId = filters.destinationFacilityId;
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.status) where.status = filters.status;

    return this.prisma.hospitalReferral.findMany({
      where,
      include: {
        patient: { include: { user: true } },
        sourceFacility: { select: { name: true, code: true } },
        destinationFacility: { select: { name: true, code: true } },
        referringDoctor: { include: { user: true } },
        receivingDoctor: { include: { user: true } },
        bedReservations: { include: { bed: { include: { room: true, ward: true } } } },
        crossFacilityTransfers: true,
        recordAuthorizations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReferralById(id: string) {
    const ref = await this.prisma.hospitalReferral.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        sourceFacility: { select: { name: true, code: true } },
        destinationFacility: { select: { name: true, code: true } },
        referringDoctor: { include: { user: true } },
        receivingDoctor: { include: { user: true } },
        admission: true,
        encounter: true,
        bedReservations: { include: { bed: { include: { room: true, ward: true } } } },
        crossFacilityTransfers: { include: { ambulanceDispatch: { include: { ambulance: true } } } },
        recordAuthorizations: { include: { authorizer: true } },
      },
    });
    if (!ref) throw new NotFoundException(`Referral '${id}' not found`);
    return ref;
  }

  async submitReferral(id: string, requestingUser: any) {
    const ref = await this.getReferralById(id);
    if (ref.status !== ReferralStatus.DRAFT) {
      throw new BadRequestException(`Only DRAFT referrals can be submitted. Current status: ${ref.status}`);
    }
    return this.prisma.hospitalReferral.update({
      where: { id },
      data: { status: ReferralStatus.REQUESTED },
      include: { patient: { include: { user: true } } },
    });
  }

  // =========================================================================
  // 3. CONCURRENCY PROTECTED REFERRAL ACCEPTANCE & BED RESERVATION
  // =========================================================================

  async acceptReferral(id: string, body: { receivingDoctorId?: string; destinationBedId?: string }, requestingUser: any) {
    return this.prisma.$transaction(async (tx) => {
      const ref = await tx.hospitalReferral.findUnique({ where: { id } });
      if (!ref) throw new NotFoundException('Referral not found');

      if (ref.status === ReferralStatus.ACCEPTED || ref.status === ReferralStatus.COMPLETED) {
        throw new BadRequestException(`Referral '${id}' is already in status '${ref.status}'`);
      }

      let receivingDoctorId = body.receivingDoctorId;
      if (!receivingDoctorId) {
        if (requestingUser.doctorProfile?.id) {
          receivingDoctorId = requestingUser.doctorProfile.id;
        } else {
          const doc = await tx.doctorProfile.findFirst({ where: { userId: requestingUser.id } });
          if (doc) {
            receivingDoctorId = doc.id;
          } else {
            const destDoc = await tx.doctorProfile.findFirst({ where: { facilityId: ref.destinationFacilityId } })
              || await tx.doctorProfile.findFirst();
            if (destDoc) receivingDoctorId = destDoc.id;
          }
        }
      }

      // If destination bed specified, perform atomic concurrency check and reservation hold
      if (body.destinationBedId) {
        const bed = await tx.bed.findUnique({ where: { id: body.destinationBedId } });
        if (!bed) throw new NotFoundException('Selected destination bed not found');

        const updatedBedCount = await tx.bed.updateMany({
          where: {
            id: body.destinationBedId,
            status: BedStatus.AVAILABLE,
          },
          data: {
            status: BedStatus.RESERVED,
          },
        });

        if (updatedBedCount.count === 0) {
          throw new ConflictException(`Destination bed '${bed.bedNumber}' is currently unavailable or reserved by another request.`);
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

        await tx.bedReservation.create({
          data: {
            bedId: body.destinationBedId,
            patientId: ref.patientId,
            reservedBy: requestingUser.id,
            referralId: ref.id,
            reservedAt: new Date(),
            expiresAt,
            status: ReservationStatus.ACTIVE,
            reason: `Hospital Referral ${ref.referralNumber}`,
          },
        });
      }

      const now = new Date();
      await tx.hospitalReferral.update({
        where: { id },
        data: {
          status: ReferralStatus.ACCEPTED,
          acceptedAt: now,
          receivingDoctorId: receivingDoctorId || null,
        },
      });

      return tx.hospitalReferral.findUnique({
        where: { id },
        include: {
          patient: { include: { user: true } },
          bedReservations: { include: { bed: true } },
        },
      });
    });
  }

  async rejectReferral(id: string, reason: string, requestingUser: any) {
    const ref = await this.getReferralById(id);
    if (ref.status === ReferralStatus.COMPLETED) {
      throw new BadRequestException('Completed referrals cannot be rejected');
    }

    return this.prisma.hospitalReferral.update({
      where: { id },
      data: {
        status: ReferralStatus.REJECTED,
        rejectedAt: new Date(),
        reason: reason ? `${ref.reason} | Rejection: ${reason}` : ref.reason,
      },
    });
  }

  async cancelReferral(id: string, requestingUser: any) {
    return this.prisma.$transaction(async (tx) => {
      const ref = await tx.hospitalReferral.findUnique({
        where: { id },
        include: { bedReservations: { where: { status: ReservationStatus.ACTIVE } } },
      });
      if (!ref) throw new NotFoundException('Referral not found');

      // Release any active bed reservation hold
      for (const res of ref.bedReservations) {
        await tx.bedReservation.update({
          where: { id: res.id },
          data: { status: ReservationStatus.CANCELLED, cancelledAt: new Date() },
        });
        await tx.bed.update({
          where: { id: res.bedId },
          data: { status: BedStatus.AVAILABLE },
        });
      }

      return tx.hospitalReferral.update({
        where: { id },
        data: { status: ReferralStatus.CANCELLED },
      });
    });
  }

  // =========================================================================
  // 4. CROSS-FACILITY PATIENT TRANSFER WORKFLOW
  // =========================================================================

  async startTransfer(referralId: string, body: { ambulanceDispatchId?: string; sourceAdmissionId?: string; sourceBedId?: string; destinationBedId?: string }, requestingUser: any) {
    return this.prisma.$transaction(async (tx) => {
      const ref = await tx.hospitalReferral.findUnique({ where: { id: referralId } });
      if (!ref) throw new NotFoundException('Referral not found');

      if (ref.status !== ReferralStatus.ACCEPTED && ref.status !== ReferralStatus.TRANSFER_IN_PROGRESS) {
        throw new BadRequestException(`Referral must be in ACCEPTED status before starting transfer. Current: ${ref.status}`);
      }

      const activeXft = await tx.crossFacilityTransfer.findFirst({
        where: { referralId, status: { in: [CrossFacilityTransferStatus.PLANNED, CrossFacilityTransferStatus.READY, CrossFacilityTransferStatus.IN_TRANSIT] } },
      });
      if (activeXft) {
        throw new ConflictException(`An active cross-facility transfer '${activeXft.transferNumber}' is already in progress for this referral.`);
      }

      const transferNumber = `XFT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      let destBedId = body.destinationBedId;
      if (!destBedId) {
        const activeRes = await tx.bedReservation.findFirst({
          where: { referralId, status: ReservationStatus.ACTIVE },
        });
        if (activeRes) destBedId = activeRes.bedId;
      }

      const now = new Date();
      const xft = await tx.crossFacilityTransfer.create({
        data: {
          transferNumber,
          referralId,
          patientId: ref.patientId,
          sourceFacilityId: ref.sourceFacilityId,
          destinationFacilityId: ref.destinationFacilityId,
          sourceAdmissionId: body.sourceAdmissionId || ref.admissionId || null,
          sourceBedId: body.sourceBedId || null,
          destinationBedId: destBedId || null,
          ambulanceDispatchId: body.ambulanceDispatchId || null,
          status: CrossFacilityTransferStatus.IN_TRANSIT,
          initiatedAt: now,
          departedAt: now,
          initiatedBy: requestingUser.id,
        },
      });

      await tx.hospitalReferral.update({
        where: { id: referralId },
        data: { status: ReferralStatus.TRANSFER_IN_PROGRESS },
      });

      return tx.crossFacilityTransfer.findUnique({
        where: { id: xft.id },
        include: { referral: true, patient: { include: { user: true } } },
      });
    });
  }

  async completeTransfer(transferId: string, requestingUser: any) {
    return this.prisma.$transaction(async (tx) => {
      const xft = await tx.crossFacilityTransfer.findUnique({
        where: { id: transferId },
        include: { referral: true },
      });
      if (!xft) throw new NotFoundException('Cross-facility transfer not found');

      if (xft.status === CrossFacilityTransferStatus.COMPLETED) {
        throw new BadRequestException('Transfer is already completed');
      }

      const now = new Date();

      // 1. Create Destination Admission at Hospital B via AdmissionService logic
      const admissionNumber = `ADM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const destDept = await tx.department.findFirst({ where: { facilityId: xft.destinationFacilityId } });

      const destAdmission = await tx.admission.create({
        data: {
          admissionNumber,
          patientId: xft.patientId,
          facilityId: xft.destinationFacilityId,
          departmentId: destDept ? destDept.id : (await tx.department.findFirstOrThrow()).id,
          admissionType: AdmissionType.TRANSFER,
          status: AdmissionStatus.ADMITTED,
          admittedAt: now,
          admittedBy: requestingUser.id,
          reason: `Cross-facility transfer from Hospital Referral ${xft.referral.referralNumber}`,
        },
      });

      // 2. Assign Destination Bed via BedService logic
      let destBedId = xft.destinationBedId;
      if (!destBedId) {
        const res = await tx.bedReservation.findFirst({
          where: { referralId: xft.referralId, status: ReservationStatus.ACTIVE },
        });
        if (res) destBedId = res.bedId;
      }

      if (destBedId) {
        const res = await tx.bedReservation.findFirst({
          where: { referralId: xft.referralId, bedId: destBedId, status: ReservationStatus.ACTIVE },
        });
        if (res) {
          await tx.bedReservation.update({
            where: { id: res.id },
            data: { status: ReservationStatus.CONVERTED, convertedAt: now },
          });
        }

        await tx.bedAssignment.create({
          data: {
            bedId: destBedId,
            patientId: xft.patientId,
            assignedBy: requestingUser.id,
            admissionId: destAdmission.id,
            reservationId: res ? res.id : null,
            assignedAt: now,
            status: AssignmentStatus.ACTIVE,
            reason: `Cross-facility admission transfer ${xft.transferNumber}`,
          },
        });

        await tx.bed.update({
          where: { id: destBedId },
          data: { status: BedStatus.OCCUPIED },
        });
      }

      // 3. Complete CrossFacilityTransfer & HospitalReferral
      await tx.crossFacilityTransfer.update({
        where: { id: transferId },
        data: {
          status: CrossFacilityTransferStatus.COMPLETED,
          arrivedAt: now,
          completedAt: now,
          completedBy: requestingUser.id,
          destinationAdmissionId: destAdmission.id,
        },
      });

      await tx.hospitalReferral.update({
        where: { id: xft.referralId },
        data: {
          status: ReferralStatus.COMPLETED,
          completedAt: now,
          admissionId: destAdmission.id,
        },
      });

      return tx.crossFacilityTransfer.findUnique({
        where: { id: transferId },
        include: {
          referral: true,
          patient: { include: { user: true } },
          destinationAdmission: true,
          destinationBed: true,
        },
      });
    });
  }

  // =========================================================================
  // 5. MEDICAL RECORD TRANSFER AUTHORIZATION
  // =========================================================================

  async requestRecordAccess(referralId: string, requestingUser: any) {
    const ref = await this.getReferralById(referralId);
    return this.prisma.medicalRecordTransferAuthorization.create({
      data: {
        referralId: ref.id,
        patientId: ref.patientId,
        sourceFacilityId: ref.sourceFacilityId,
        destinationFacilityId: ref.destinationFacilityId,
        authorizedBy: requestingUser.id,
        authorizationType: RecordAuthorizationType.ENCOUNTER_SUMMARY,
        status: RecordAuthorizationStatus.REQUESTED,
        authorizedAt: new Date(),
      },
    });
  }

  async authorizeRecordAccess(referralId: string, dto: AuthorizeRecordAccessDto, requestingUser: any) {
    const ref = await this.getReferralById(referralId);
    const expiresAt = dto.expiresInDays ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000) : null;

    return this.prisma.medicalRecordTransferAuthorization.create({
      data: {
        referralId: ref.id,
        patientId: ref.patientId,
        sourceFacilityId: ref.sourceFacilityId,
        destinationFacilityId: ref.destinationFacilityId,
        authorizedBy: requestingUser.id,
        authorizationType: dto.authorizationType,
        status: RecordAuthorizationStatus.AUTHORIZED,
        authorizedAt: new Date(),
        expiresAt,
      },
      include: { authorizer: { select: { firstName: true, lastName: true } } },
    });
  }

  async revokeRecordAccess(authorizationId: string, requestingUser: any) {
    const authRecord = await this.prisma.medicalRecordTransferAuthorization.findUnique({ where: { id: authorizationId } });
    if (!authRecord) throw new NotFoundException('Record access authorization not found');

    return this.prisma.medicalRecordTransferAuthorization.update({
      where: { id: authorizationId },
      data: { status: RecordAuthorizationStatus.REVOKED },
    });
  }

  async getTransferableRecords(referralId: string, requestingUser: any) {
    const ref = await this.getReferralById(referralId);

    // Facility check or patient check
    const roleCode = this.getUserRole(requestingUser);
    if (roleCode === RoleCode.PATIENT) {
      if (!requestingUser.patientProfile || requestingUser.patientProfile.id !== ref.patientId) {
        throw new ForbiddenException('Patients can only view their own transfer records');
      }
    }

    const activeAuths = await this.prisma.medicalRecordTransferAuthorization.findMany({
      where: {
        referralId,
        status: RecordAuthorizationStatus.AUTHORIZED,
      },
    });

    if (activeAuths.length === 0 && roleCode !== RoleCode.MEDINEXA_ADMIN) {
      throw new ForbiddenException('Medical record transfer authorization missing or revoked for this referral.');
    }

    const authTypes = activeAuths.map((a) => a.authorizationType);
    const allowFull = authTypes.includes(RecordAuthorizationType.FULL_RECORD) || roleCode === RoleCode.MEDINEXA_ADMIN;
    const allowSummary = allowFull || authTypes.includes(RecordAuthorizationType.ENCOUNTER_SUMMARY);
    const allowLab = allowFull || authTypes.includes(RecordAuthorizationType.LAB_RESULTS);
    const allowRx = allowFull || authTypes.includes(RecordAuthorizationType.PRESCRIPTIONS);

    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: ref.patientId },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
    });

    let encounters: any[] = [];
    if (allowSummary) {
      encounters = await this.prisma.clinicalEncounter.findMany({
        where: { patientId: ref.patientId },
        include: { clinicalNotes: true, vitalSigns: true, diagnoses: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    }

    let labResults: any[] = [];
    if (allowLab) {
      labResults = await this.prisma.labResult.findMany({
        where: { patientId: ref.patientId, resultStatus: 'FINAL' },
        include: { labOrderItem: { include: { labTest: true } } },
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
    }

    let prescriptions: any[] = [];
    if (allowRx) {
      prescriptions = await this.prisma.prescription.findMany({
        where: { patientId: ref.patientId },
        include: { items: { include: { medication: true } } },
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
    }

    return {
      referralId: ref.id,
      patient,
      clinicalSummary: ref.clinicalSummary,
      reason: ref.reason,
      authorizedCategories: authTypes,
      encounters: allowSummary ? encounters : [],
      labResults: allowLab ? labResults : [],
      prescriptions: allowRx ? prescriptions : [],
    };
  }

  async getPatientReferrals(patientId: string, requestingUser: any) {
    const roleCode = this.getUserRole(requestingUser);
    if (roleCode === RoleCode.PATIENT) {
      if (!requestingUser.patientProfile || requestingUser.patientProfile.id !== patientId) {
        throw new ForbiddenException('Patients can only view their own referrals');
      }
    }

    return this.prisma.hospitalReferral.findMany({
      where: { patientId },
      include: {
        sourceFacility: { select: { name: true, code: true } },
        destinationFacility: { select: { name: true, code: true } },
        referringDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        receivingDoctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
