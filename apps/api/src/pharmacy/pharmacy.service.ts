import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WardService } from '../ward/ward.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { DispensePrescriptionDto } from './dto/dispense-prescription.dto';
import {
  PrescriptionStatus,
  DispenseStatus,
  RoleCode,
} from '@medinexa/types';

import { AuditService } from '../audit/audit.service';

@Injectable()
export class PharmacyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wardService: WardService,
    private readonly auditService: AuditService,
  ) {}

  private getUserRole(user: any): string {
    if (!user) return '';
    if (user.roleCode) return user.roleCode;
    if (typeof user.role === 'string') return user.role;
    if (user.role && user.role.code) return user.role.code;
    return '';
  }

  // =========================================================================
  // 1. MEDICATION CATALOG
  // =========================================================================

  async getMedications() {
    return this.prisma.medication.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { genericName: 'asc' },
    });
  }

  async createMedication(dto: CreateMedicationDto) {
    const existing = await this.prisma.medication.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Medication with code '${dto.code}' already exists`);
    }

    return this.prisma.medication.create({
      data: dto as any,
    });
  }

  async updateMedication(id: string, dto: Partial<CreateMedicationDto>) {
    const med = await this.prisma.medication.findUnique({ where: { id } });
    if (!med) throw new NotFoundException(`Medication with ID '${id}' not found`);

    return this.prisma.medication.update({
      where: { id },
      data: dto as any,
    });
  }

  // =========================================================================
  // 2. PRESCRIPTION MANAGEMENT
  // =========================================================================

  async createPrescription(dto: CreatePrescriptionDto, requestingUser: any) {
    const enc = await this.prisma.clinicalEncounter.findUnique({
      where: { id: dto.encounterId },
      include: { patient: true, doctor: true, facility: true },
    });
    if (!enc) {
      throw new NotFoundException(`Clinical Encounter with ID '${dto.encounterId}' not found`);
    }

    await this.wardService.validateFacilityAccess(enc.facilityId, requestingUser);

    const userRole = this.getUserRole(requestingUser);
    if (userRole === RoleCode.PATIENT || userRole === RoleCode.PHARMACY_STAFF) {
      throw new ForbiddenException('Only authorized medical providers can create prescriptions');
    }

    const prescriptionNumber = `RX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.$transaction(async (tx) => {
      const rx = await tx.prescription.create({
        data: {
          prescriptionNumber,
          encounterId: dto.encounterId,
          patientId: enc.patientId,
          doctorId: enc.doctorId,
          facilityId: enc.facilityId,
          status: PrescriptionStatus.DRAFT,
          notes: dto.notes || null,
          prescribedAt: new Date(),
        },
      });

      for (const item of dto.items) {
        await tx.prescriptionItem.create({
          data: {
            prescriptionId: rx.id,
            medicationId: item.medicationId,
            dosage: item.dosage,
            frequency: item.frequency,
            route: item.route,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions || null,
            refillsAllowed: item.refillsAllowed || 0,
          },
        });
      }

      return tx.prescription.findUnique({
        where: { id: rx.id },
        include: {
          items: { include: { medication: true } },
          patient: { include: { user: true } },
          doctor: { include: { user: true } },
          facility: { select: { name: true, code: true } },
        },
      });
    });
  }

  async issuePrescription(id: string, requestingUser: any) {
    const rx = await this.prisma.prescription.findUnique({ where: { id } });
    if (!rx) throw new NotFoundException('Prescription not found');

    await this.wardService.validateFacilityAccess(rx.facilityId, requestingUser);

    if (rx.status === PrescriptionStatus.ISSUED || rx.status === PrescriptionStatus.DISPENSED) {
      throw new ConflictException(`Prescription '${id}' is already issued or finalized.`);
    }

    return this.prisma.prescription.update({
      where: { id },
      data: {
        status: PrescriptionStatus.ISSUED,
        prescribedAt: new Date(),
      },
      include: {
        items: { include: { medication: true } },
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });
  }

  async cancelPrescription(id: string, requestingUser: any) {
    const rx = await this.prisma.prescription.findUnique({ where: { id } });
    if (!rx) throw new NotFoundException('Prescription not found');

    await this.wardService.validateFacilityAccess(rx.facilityId, requestingUser);

    if (rx.status === PrescriptionStatus.DISPENSED) {
      throw new ConflictException('Cannot cancel a fully dispensed prescription');
    }

    return this.prisma.prescription.update({
      where: { id },
      data: { status: PrescriptionStatus.CANCELLED },
    });
  }

  async getPrescriptions(filters: { facilityId?: string; patientId?: string; status?: PrescriptionStatus }) {
    const where: any = {};
    if (filters.facilityId) where.facilityId = filters.facilityId;
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.status) where.status = filters.status;

    return this.prisma.prescription.findMany({
      where,
      include: {
        items: { include: { medication: true, dispenses: true } },
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        facility: { select: { name: true, code: true } },
        dispenses: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPrescriptionById(id: string) {
    const rx = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        items: { include: { medication: true, dispenses: true } },
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        facility: { select: { name: true, code: true } },
        encounter: true,
        dispenses: true,
      },
    });
    if (!rx) throw new NotFoundException(`Prescription with ID '${id}' not found`);
    return rx;
  }

  async getEncounterPrescriptions(encounterId: string) {
    return this.prisma.prescription.findMany({
      where: { encounterId },
      include: {
        items: { include: { medication: true, dispenses: true } },
        dispenses: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPatientPrescriptions(patientId: string, requestingUser: any) {
    const userRole = this.getUserRole(requestingUser);
    if (userRole === RoleCode.PATIENT) {
      if (!requestingUser.patientProfile || requestingUser.patientProfile.id !== patientId) {
        throw new ForbiddenException('Patients can only view their own prescriptions');
      }
    }

    return this.prisma.prescription.findMany({
      where: {
        patientId,
        status: { in: [PrescriptionStatus.ISSUED, PrescriptionStatus.PARTIALLY_DISPENSED, PrescriptionStatus.DISPENSED] },
      },
      include: {
        items: { include: { medication: true } },
        doctor: { include: { user: true } },
        facility: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =========================================================================
  // 3. MANDATORY CONCURRENT PHARMACY DISPENSING ENGINE
  // =========================================================================

  async dispensePrescription(prescriptionId: string, dto: DispensePrescriptionDto, requestingUser: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch Prescription & Item
      const rx = await tx.prescription.findUnique({
        where: { id: prescriptionId },
        include: { items: true },
      });
      if (!rx) throw new NotFoundException('Prescription not found');

      await this.wardService.validateFacilityAccess(rx.facilityId, requestingUser);

      // Check Status
      if (rx.status === PrescriptionStatus.CANCELLED || rx.status === PrescriptionStatus.EXPIRED) {
        throw new BadRequestException(`Cannot dispense a '${rx.status}' prescription`);
      }
      if (rx.status === PrescriptionStatus.DRAFT) {
        throw new BadRequestException('Cannot dispense an unissued DRAFT prescription');
      }

      const item = rx.items.find((i) => i.id === dto.prescriptionItemId);
      if (!item) throw new NotFoundException('Prescription item not found in specified prescription');

      // 2. BATCH NUMBER & EXPIRATION DATE VALIDATION
      if (!dto.batchNumber || !dto.batchNumber.trim()) {
        throw new BadRequestException('Batch number is required for medication dispensing');
      }
      if (!dto.expirationDate) {
        throw new BadRequestException('Expiration date is required for medication dispensing');
      }
      const expiry = new Date(dto.expirationDate);
      if (isNaN(expiry.getTime())) {
        throw new BadRequestException('Invalid expiration date format');
      }
      if (expiry < new Date()) {
        throw new BadRequestException(`Cannot dispense medication from an expired batch. Expiration date (${expiry.toISOString().slice(0, 10)}) has already passed.`);
      }

      // 3. CONCURRENCY & LIMIT CHECK: Calculate sum of existing dispenses
      const prevDispenses = await tx.prescriptionDispense.aggregate({
        where: {
          prescriptionItemId: dto.prescriptionItemId,
          status: DispenseStatus.DISPENSED,
        },
        _sum: { quantityDispensed: true },
      });

      const alreadyDispensed = prevDispenses._sum.quantityDispensed || 0;
      const totalAttempted = alreadyDispensed + dto.quantity;

      if (totalAttempted > item.quantity) {
        throw new ConflictException(
          `Cannot dispense ${dto.quantity} units. Already dispensed: ${alreadyDispensed}/${item.quantity} units.`,
        );
      }

      // 4. Create Dispense Record
      const dispenseNumber = `DSP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const dispense = await tx.prescriptionDispense.create({
        data: {
          dispenseNumber,
          prescriptionId,
          prescriptionItemId: dto.prescriptionItemId,
          dispensedBy: requestingUser.id,
          quantityDispensed: dto.quantity,
          batchNumber: dto.batchNumber.trim(),
          expirationDate: expiry,
          dispensedAt: new Date(),
          status: DispenseStatus.DISPENSED,
          notes: dto.notes || null,
        },
      });

      await this.auditService.logPhiAccess({
        userId: requestingUser.id,
        role: this.getUserRole(requestingUser),
        facilityId: rx.facilityId,
        action: 'DISPENSE_MEDICATION',
        resource: `prescription:${prescriptionId}`,
        details: { prescriptionItemId: dto.prescriptionItemId, quantity: dto.quantity, batchNumber: dto.batchNumber.trim() },
      });

      // 4. Update Prescription Status (PARTIALLY_DISPENSED or DISPENSED)
      let allItemsFullyDispensed = true;

      for (const rxItem of rx.items) {
        const itemSum = await tx.prescriptionDispense.aggregate({
          where: {
            prescriptionItemId: rxItem.id,
            status: DispenseStatus.DISPENSED,
          },
          _sum: { quantityDispensed: true },
        });

        const itemDispensedCount = itemSum._sum.quantityDispensed || 0;
        if (itemDispensedCount < rxItem.quantity) {
          allItemsFullyDispensed = false;
        }
      }

      const targetStatus = allItemsFullyDispensed
        ? PrescriptionStatus.DISPENSED
        : PrescriptionStatus.PARTIALLY_DISPENSED;

      await tx.prescription.update({
        where: { id: prescriptionId },
        data: { status: targetStatus },
      });

      return tx.prescriptionDispense.findUnique({
        where: { id: dispense.id },
        include: {
          prescriptionItem: { include: { medication: true } },
          dispenser: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    });
  }
}
