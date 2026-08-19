import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WardService } from '../ward/ward.service';
import { CreateEncounterDto } from './dto/create-encounter.dto';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { AmendClinicalNoteDto } from './dto/amend-clinical-note.dto';
import { RecordVitalSignDto } from './dto/record-vital-sign.dto';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import {
  EncounterStatus,
  EncounterType,
  NoteStatus,
  DiagnosisStatus,
  RoleCode,
  ClinicalTimelineItemDto,
} from '@medinexa/types';

import { AuditService } from '../audit/audit.service';

@Injectable()
export class EhrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wardService: WardService,
    private readonly auditService: AuditService,
  ) {}

  // =========================================================================
  // 1. CLINICAL ENCOUNTER ENGINE
  // =========================================================================

  async createEncounter(dto: CreateEncounterDto, requestingUser: any) {
    // 1. Verify Patient exists
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: dto.patientId },
      include: { user: true },
    });
    if (!patient) {
      throw new NotFoundException(`Patient profile with ID '${dto.patientId}' not found`);
    }

    // 2. Verify Doctor exists
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id: dto.doctorId },
      include: { user: true },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor profile with ID '${dto.doctorId}' not found`);
    }

    // 3. Multi-hospital security check
    await this.wardService.validateFacilityAccess(dto.facilityId, requestingUser);

    // 4. Verify Facility exists
    const facility = await this.prisma.facility.findUnique({
      where: { id: dto.facilityId },
    });
    if (!facility) {
      throw new NotFoundException(`Facility with ID '${dto.facilityId}' not found`);
    }

    // 5. Verify Department belongs to Facility
    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department) {
      throw new NotFoundException(`Department with ID '${dto.departmentId}' not found`);
    }
    if (department.facilityId !== dto.facilityId) {
      throw new BadRequestException(
        `Department '${department.name}' does not belong to facility '${facility.name}'`,
      );
    }

    // 6. INPATIENT Encounter Rule: Active Admission check
    let validAdmissionId: string | null = dto.admissionId || null;

    if (dto.encounterType === EncounterType.INPATIENT) {
      if (!validAdmissionId) {
        // Try finding active admission for patient at facility
        const activeAdm = await this.prisma.admission.findFirst({
          where: {
            patientId: dto.patientId,
            facilityId: dto.facilityId,
            status: { in: ['PLANNED', 'ADMITTED', 'TRANSFERRED', 'DISCHARGE_PENDING'] },
          },
        });
        if (!activeAdm) {
          throw new BadRequestException(
            `Inpatient encounter requires an active admission for patient '${patient.user.firstName} ${patient.user.lastName}' at this facility.`,
          );
        }
        validAdmissionId = activeAdm.id;
      } else {
        const adm = await this.prisma.admission.findUnique({ where: { id: validAdmissionId } });
        if (!adm) {
          throw new NotFoundException(`Admission with ID '${validAdmissionId}' not found`);
        }
        if (adm.patientId !== dto.patientId) {
          throw new BadRequestException(`Admission '${adm.admissionNumber}' does not belong to specified patient`);
        }
        if (adm.facilityId !== dto.facilityId) {
          throw new BadRequestException(`Admission '${adm.admissionNumber}' does not belong to specified facility`);
        }
      }
    }

    // 7. Generate unique encounter number
    const encounterNumber = `ENC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const encounter = await this.prisma.clinicalEncounter.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        facilityId: dto.facilityId,
        departmentId: dto.departmentId,
        admissionId: validAdmissionId,
        encounterNumber,
        encounterType: dto.encounterType,
        status: EncounterStatus.IN_PROGRESS,
        reasonForVisit: dto.reasonForVisit || null,
        startedAt: new Date(),
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, specialty: true } },
        facility: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
        admission: true,
      },
    });

    return encounter;
  }

  async getEncounters(filters: {
    facilityId?: string;
    departmentId?: string;
    doctorId?: string;
    patientId?: string;
    encounterType?: EncounterType;
    status?: EncounterStatus;
  }) {
    const where: any = {};
    if (filters.facilityId) where.facilityId = filters.facilityId;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.doctorId) where.doctorId = filters.doctorId;
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.encounterType) where.encounterType = filters.encounterType;
    if (filters.status) where.status = filters.status;

    return this.prisma.clinicalEncounter.findMany({
      where,
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, specialty: true } },
        facility: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
        admission: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEncounterById(id: string) {
    const enc = await this.prisma.clinicalEncounter.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, specialty: true } },
        facility: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
        admission: true,
        clinicalNotes: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true, email: true } },
            signer: { select: { id: true, firstName: true, lastName: true } },
            versions: { orderBy: { versionNumber: 'desc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
        vitalSigns: {
          include: {
            recorder: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { recordedAt: 'desc' },
        },
        diagnoses: {
          include: {
            diagnoser: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!enc) {
      throw new NotFoundException(`Clinical Encounter with ID '${id}' not found`);
    }

    return enc;
  }

  async updateEncounterStatus(id: string, status: EncounterStatus, requestingUser: any) {
    const enc = await this.getEncounterById(id);
    await this.wardService.validateFacilityAccess(enc.facilityId, requestingUser);

    if (enc.status === EncounterStatus.COMPLETED && status !== EncounterStatus.COMPLETED) {
      throw new BadRequestException('Cannot modify status of a COMPLETED encounter');
    }

    const data: any = { status };
    if (status === EncounterStatus.COMPLETED) {
      data.endedAt = new Date();
    }

    return this.prisma.clinicalEncounter.update({
      where: { id },
      data,
    });
  }

  // =========================================================================
  // 2. CLINICAL NOTES (IMMUTABLE + SIGNING + AMENDMENTS)
  // =========================================================================

  private getUserRole(user: any): string {
    if (!user) return '';
    if (user.roleCode) return user.roleCode;
    if (typeof user.role === 'string') return user.role;
    if (user.role && user.role.code) return user.role.code;
    return '';
  }

  async createClinicalNote(encounterId: string, dto: CreateClinicalNoteDto, requestingUser: any) {
    const enc = await this.getEncounterById(encounterId);
    await this.wardService.validateFacilityAccess(enc.facilityId, requestingUser);

    const userRole = this.getUserRole(requestingUser);
    if (userRole === RoleCode.PATIENT) {
      throw new ForbiddenException('Patients cannot create clinical notes');
    }

    return this.prisma.clinicalNote.create({
      data: {
        encounterId,
        authorId: requestingUser.id,
        noteType: dto.noteType,
        content: dto.content,
        status: NoteStatus.DRAFT,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async updateDraftNote(id: string, content: string, requestingUser: any) {
    const note = await this.prisma.clinicalNote.findUnique({
      where: { id },
      include: { encounter: true },
    });
    if (!note) throw new NotFoundException('Clinical note not found');

    if (note.status !== NoteStatus.DRAFT) {
      throw new ConflictException(
        `Clinical note is in status '${note.status}' and cannot be directly edited. Use amendment workflow.`,
      );
    }

    const userRole = this.getUserRole(requestingUser);
    if (note.authorId !== requestingUser.id && userRole !== RoleCode.MEDINEXA_ADMIN) {
      throw new ForbiddenException('Only the author can update draft clinical note content');
    }

    return this.prisma.clinicalNote.update({
      where: { id },
      data: { content },
    });
  }

  async signNote(id: string, requestingUser: any) {
    const note = await this.prisma.clinicalNote.findUnique({
      where: { id },
      include: { encounter: true },
    });
    if (!note) throw new NotFoundException('Clinical note not found');

    const userRole = this.getUserRole(requestingUser);
    if (userRole === RoleCode.PATIENT) {
      throw new ForbiddenException('Patients cannot sign clinical notes');
    }

    if (note.status === NoteStatus.SIGNED || note.status === NoteStatus.AMENDED) {
      throw new ConflictException(`Clinical note '${id}' is already signed.`);
    }

    return this.prisma.clinicalNote.update({
      where: { id },
      data: {
        status: NoteStatus.SIGNED,
        signedAt: new Date(),
        signedBy: requestingUser.id,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        signer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async amendNote(id: string, dto: AmendClinicalNoteDto, requestingUser: any) {
    const note = await this.prisma.clinicalNote.findUnique({
      where: { id },
      include: { encounter: true, versions: true },
    });
    if (!note) throw new NotFoundException('Clinical note not found');

    if (note.status === NoteStatus.DRAFT) {
      throw new BadRequestException('Draft notes do not require amendments. Edit content directly.');
    }

    const userRole = this.getUserRole(requestingUser);
    if (userRole === RoleCode.PATIENT) {
      throw new ForbiddenException('Patients cannot amend clinical notes');
    }

    return this.prisma.$transaction(async (tx) => {
      const nextVersion = note.versions.length + 1;

      // 1. Save prior version
      await tx.clinicalNoteVersion.create({
        data: {
          noteId: id,
          versionNumber: nextVersion,
          content: note.content,
          reason: dto.reason,
          createdBy: requestingUser.id,
        },
      });

      // 2. Update note content and mark AMENDED
      return tx.clinicalNote.update({
        where: { id },
        data: {
          content: dto.content,
          status: NoteStatus.AMENDED,
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          versions: { orderBy: { versionNumber: 'desc' } },
        },
      });
    });
  }

  // =========================================================================
  // 3. LONGITUDINAL VITAL SIGNS
  // =========================================================================

  async recordVitalSign(encounterId: string, dto: RecordVitalSignDto, requestingUser: any) {
    const enc = await this.getEncounterById(encounterId);
    await this.wardService.validateFacilityAccess(enc.facilityId, requestingUser);

    const userRole = this.getUserRole(requestingUser);
    if (userRole === RoleCode.PATIENT) {
      throw new ForbiddenException('Patients cannot record clinical vital signs');
    }

    const hasMetric =
      (dto.temperature !== undefined && dto.temperature !== null) ||
      (dto.heartRate !== undefined && dto.heartRate !== null) ||
      (dto.respiratoryRate !== undefined && dto.respiratoryRate !== null) ||
      (dto.systolicBP !== undefined && dto.systolicBP !== null) ||
      (dto.diastolicBP !== undefined && dto.diastolicBP !== null) ||
      (dto.oxygenSaturation !== undefined && dto.oxygenSaturation !== null) ||
      (dto.weight !== undefined && dto.weight !== null) ||
      (dto.height !== undefined && dto.height !== null);

    if (!hasMetric) {
      throw new BadRequestException('At least one valid vital sign measurement (BP, Heart Rate, Temp, SpO2, etc.) must be provided');
    }

    if (dto.systolicBP !== undefined || dto.diastolicBP !== undefined) {
      if (dto.systolicBP === undefined || dto.diastolicBP === undefined) {
        throw new BadRequestException('Both Systolic and Diastolic Blood Pressure values must be provided together');
      }
      if (dto.systolicBP <= dto.diastolicBP) {
        throw new BadRequestException('Systolic BP must be greater than Diastolic BP');
      }
    }

    return this.prisma.vitalSign.create({
      data: {
        encounterId,
        patientId: enc.patientId,
        recordedBy: requestingUser.id,
        recordedAt: new Date(),
        temperature: dto.temperature || null,
        heartRate: dto.heartRate || null,
        respiratoryRate: dto.respiratoryRate || null,
        systolicBP: dto.systolicBP || null,
        diastolicBP: dto.diastolicBP || null,
        oxygenSaturation: dto.oxygenSaturation || null,
        weight: dto.weight || null,
        height: dto.height || null,
        notes: dto.notes || null,
      },
      include: {
        recorder: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getPatientVitals(patientId: string) {
    return this.prisma.vitalSign.findMany({
      where: { patientId },
      include: {
        recorder: { select: { id: true, firstName: true, lastName: true } },
        encounter: { select: { encounterNumber: true, encounterType: true } },
      },
      orderBy: { recordedAt: 'desc' },
    });
  }

  // =========================================================================
  // 4. CLINICAL DIAGNOSES
  // =========================================================================

  async createDiagnosis(encounterId: string, dto: CreateDiagnosisDto, requestingUser: any) {
    const enc = await this.getEncounterById(encounterId);
    await this.wardService.validateFacilityAccess(enc.facilityId, requestingUser);

    const userRole = this.getUserRole(requestingUser);
    if (userRole === RoleCode.PATIENT) {
      throw new ForbiddenException('Patients cannot create clinical diagnoses');
    }

    return this.prisma.diagnosis.create({
      data: {
        encounterId,
        patientId: enc.patientId,
        recordedBy: requestingUser.id,
        diagnosisCode: dto.diagnosisCode || null,
        diagnosisName: dto.diagnosisName,
        description: dto.description || null,
        diagnosisType: dto.diagnosisType || 'PRIMARY',
        status: dto.status || DiagnosisStatus.ACTIVE,
        diagnosedAt: new Date(),
      },
      include: {
        diagnoser: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async updateDiagnosis(id: string, dto: Partial<CreateDiagnosisDto>, requestingUser: any) {
    const diag = await this.prisma.diagnosis.findUnique({
      where: { id },
      include: { encounter: true },
    });
    if (!diag) throw new NotFoundException('Diagnosis not found');

    const userRole = this.getUserRole(requestingUser);
    if (userRole === RoleCode.PATIENT) {
      throw new ForbiddenException('Patients cannot update clinical diagnoses');
    }

    const dataToUpdate: any = {};
    if (dto.diagnosisName !== undefined) dataToUpdate.diagnosisName = dto.diagnosisName;
    if (dto.diagnosisCode !== undefined) dataToUpdate.diagnosisCode = dto.diagnosisCode;
    if (dto.description !== undefined) dataToUpdate.description = dto.description;
    if (dto.diagnosisType !== undefined) dataToUpdate.diagnosisType = dto.diagnosisType;
    if (dto.status !== undefined) dataToUpdate.status = dto.status;

    return this.prisma.diagnosis.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  // =========================================================================
  // 5. PATIENT CLINICAL TIMELINE & OWNERSHIP ENFORCEMENT
  // =========================================================================

  async getPatientClinicalTimeline(patientId: string, requestingUser: any) {
    const userRole = this.getUserRole(requestingUser);
    if (userRole === RoleCode.PATIENT) {
      if (!requestingUser.patientProfile || requestingUser.patientProfile.id !== patientId) {
        throw new ForbiddenException(
          'Access denied. Patients can only view their own clinical records and timeline.',
        );
      }
    }

    // 2. Patient existence check
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundException(`Patient profile with ID '${patientId}' not found`);
    }

    // 3. Fetch Encounters, Notes, Vitals, Diagnoses
    const encounters = await this.prisma.clinicalEncounter.findMany({
      where: { patientId },
      include: {
        doctor: { include: { user: true } },
        facility: { select: { name: true } },
        department: { select: { name: true } },
      },
    });

    const notes = await this.prisma.clinicalNote.findMany({
      where: { encounter: { patientId } },
      include: {
        author: { select: { firstName: true, lastName: true } },
        encounter: { select: { encounterNumber: true } },
      },
    });

    const vitals = await this.prisma.vitalSign.findMany({
      where: { patientId },
      include: {
        recorder: { select: { firstName: true, lastName: true } },
      },
    });

    const diagnoses = await this.prisma.diagnosis.findMany({
      where: { patientId },
      include: {
        diagnoser: { select: { firstName: true, lastName: true } },
      },
    });

    const labOrders = await this.prisma.labOrder.findMany({
      where: { patientId },
      include: {
        items: { include: { labTest: true } },
        doctor: { include: { user: true } },
      },
    });

    const labResults = await this.prisma.labResult.findMany({
      where: {
        patientId,
        resultStatus: { in: ['FINAL', 'AMENDED'] },
      },
      include: {
        labOrderItem: { include: { labTest: true } },
        verifier: { select: { firstName: true, lastName: true } },
      },
    });

    const prescriptions = await this.prisma.prescription.findMany({
      where: {
        patientId,
        status: { in: ['ISSUED', 'PARTIALLY_DISPENSED', 'DISPENSED'] },
      },
      include: {
        items: { include: { medication: true } },
        doctor: { include: { user: true } },
      },
    });

    // 4. Map into unified chronological timeline
    const items: ClinicalTimelineItemDto[] = [];

    encounters.forEach((e) => {
      items.push({
        id: e.id,
        itemType: 'ENCOUNTER',
        timestamp: e.startedAt.toISOString(),
        title: `Encounter ${e.encounterNumber} (${e.encounterType})`,
        summary: `Started at ${e.facility.name} - ${e.department.name} with Dr. ${e.doctor.user.lastName}`,
        details: e,
      });
    });

    notes.forEach((n) => {
      items.push({
        id: n.id,
        itemType: 'CLINICAL_NOTE',
        timestamp: n.createdAt.toISOString(),
        title: `Clinical Note [${n.noteType}] (${n.status})`,
        summary: `Authored by ${n.author.firstName} ${n.author.lastName}`,
        details: n,
      });
    });

    vitals.forEach((v) => {
      const summaryParts = [];
      if (v.temperature) summaryParts.push(`Temp: ${v.temperature}°C`);
      if (v.heartRate) summaryParts.push(`HR: ${v.heartRate} bpm`);
      if (v.systolicBP && v.diastolicBP) summaryParts.push(`BP: ${v.systolicBP}/${v.diastolicBP} mmHg`);
      if (v.oxygenSaturation) summaryParts.push(`SpO2: ${v.oxygenSaturation}%`);

      items.push({
        id: v.id,
        itemType: 'VITAL_SIGN',
        timestamp: v.recordedAt.toISOString(),
        title: `Vital Signs Recorded`,
        summary: summaryParts.join(' | ') || 'Vitals recorded',
        details: v,
      });
    });

    diagnoses.forEach((d) => {
      items.push({
        id: d.id,
        itemType: 'DIAGNOSIS',
        timestamp: d.diagnosedAt.toISOString(),
        title: `Diagnosis: ${d.diagnosisName}`,
        summary: `${d.diagnosisType} Diagnosis (${d.status}) recorded by ${d.diagnoser.firstName} ${d.diagnoser.lastName}`,
        details: d,
      });
    });

    labOrders.forEach((lo) => {
      const testNames = lo.items.map((i) => i.labTest.name).join(', ');
      items.push({
        id: lo.id,
        itemType: 'LAB_ORDER',
        timestamp: lo.orderedAt.toISOString(),
        title: `Lab Order ${lo.orderNumber} (${lo.priority})`,
        summary: `Tests: ${testNames} | Status: ${lo.status}`,
        details: lo,
      });
    });

    labResults.forEach((lr) => {
      items.push({
        id: lr.id,
        itemType: 'LAB_RESULT',
        timestamp: lr.enteredAt.toISOString(),
        title: `Lab Result: ${lr.labOrderItem.labTest.name}`,
        summary: `Result: ${lr.resultValue} ${lr.unit || ''} (Flag: ${lr.abnormalFlag}) | Status: ${lr.resultStatus}`,
        details: lr,
      });
    });

    prescriptions.forEach((p) => {
      const medNames = p.items.map((i) => i.medication.brandName).join(', ');
      items.push({
        id: p.id,
        itemType: 'PRESCRIPTION',
        timestamp: p.prescribedAt.toISOString(),
        title: `Prescription ${p.prescriptionNumber} (${p.status})`,
        summary: `Medications: ${medNames} | Dr. ${p.doctor.user.lastName}`,
        details: p,
      });
    });

    const emergencies = await this.prisma.emergencyRequest.findMany({
      where: { patientId },
      include: { sourceFacility: { select: { name: true } }, destinationFacility: { select: { name: true } } },
    });

    const referrals = await this.prisma.hospitalReferral.findMany({
      where: { patientId },
      include: { sourceFacility: { select: { name: true } }, destinationFacility: { select: { name: true } } },
    });

    emergencies.forEach((e) => {
      items.push({
        id: e.id,
        itemType: 'EMERGENCY' as any,
        timestamp: e.requestedAt.toISOString(),
        title: `Emergency Incident ${e.emergencyNumber} (${e.severity})`,
        summary: `Type: ${e.emergencyType} | Status: ${e.status} | Address: ${e.pickupAddress}`,
        details: e,
      });
    });

    referrals.forEach((r) => {
      items.push({
        id: r.id,
        itemType: 'REFERRAL' as any,
        timestamp: r.requestedAt.toISOString(),
        title: `Hospital Referral ${r.referralNumber} (${r.urgency})`,
        summary: `${r.sourceFacility.name} -> ${r.destinationFacility.name} | Status: ${r.status}`,
        details: r,
      });
    });

    // Sort timeline descending by timestamp
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
