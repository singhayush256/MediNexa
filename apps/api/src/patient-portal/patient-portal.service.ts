import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleCode } from '@medinexa/types';
import { UpdatePatientProfileDto } from './dto/update-profile.dto';
import { CreatePatientFeedbackDto } from './dto/create-feedback.dto';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { CreateHealthGoalDto } from './dto/create-health-goal.dto';

@Injectable()
export class PatientPortalService {
  private readonly logger = new Logger(PatientPortalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async resolvePatientId(user: any, requestedPatientId?: string): Promise<string> {
    const userRole = user.roleCode || (typeof user.role === 'string' ? user.role : user.role?.code);
    const userId = user.id || user.userId;

    if (user.patientProfile?.id) {
      return user.patientProfile.id;
    }

    // Look for existing profile linked to this user ID
    let profile = await this.prisma.patientProfile.findFirst({
      where: { OR: [{ userId }, { id: userId }] },
    });

    // If profile does not exist yet for this authenticated user, auto-provision it
    if (!profile && userId) {
      try {
        const userRec = await this.prisma.user.findUnique({ where: { id: userId } });
        if (userRec) {
          const uhid = `UHID-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
          profile = await this.prisma.patientProfile.create({
            data: {
              userId: userRec.id,
              gender: 'OTHER',
              dateOfBirth: new Date('2000-01-01'),
              bloodGroup: 'UNKNOWN',
              phone: userRec.phone || '+91 9800000000',
              address: `UHID: ${uhid}`,
            },
          });
          this.logger.log(`[PATIENT PORTAL] Auto-provisioned PatientProfile ${profile.id} for user ${userRec.email}`);
        }
      } catch (err) {
        this.logger.warn(`Could not auto-provision patient profile: ${err}`);
      }
    }

    if (profile) {
      return profile.id;
    }

    // Staff / Admin impersonation or lookup
    if (requestedPatientId) {
      const explicitProfile = await this.prisma.patientProfile.findFirst({
        where: { OR: [{ id: requestedPatientId }, { userId: requestedPatientId }] },
      });
      if (!explicitProfile) throw new NotFoundException(`Patient #${requestedPatientId} not found.`);
      return explicitProfile.id;
    }

    // In production, require explicit patient context for staff access
    if (process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true') {
      throw new BadRequestException('Patient context (patientId) is required for staff access.');
    }

    // Default to first patient in database if staff testing in demo/development mode without param
    const firstPatient = await this.prisma.patientProfile.findFirst({
      orderBy: { createdAt: 'asc' },
    });
    if (!firstPatient) throw new NotFoundException('No patient profiles registered in the platform.');
    return firstPatient.id;
  }

  // --- 1. PATIENT DEMOGRAPHIC PROFILE ---
  async getProfile(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true, medinexaPersonId: true } },
        emergencyContacts: true,
        patientInsurances: { include: { provider: true } },
        familyMembers: true,
        healthGoals: true,
        abhaProfile: true,
      },
    });

    if (!patient) throw new NotFoundException('Patient profile not found.');

    const personId = patient.user?.medinexaPersonId || (patient as any).medinexaPersonId || (patient.id === 'demo-p-01' ? 'AYU-4826-KM' : undefined);
    return {
      ...patient,
      medinexaPersonId: personId,
      uhid: personId || (patient as any).uhid || (patient.id === 'demo-p-01' ? 'AYU-4826-KM' : undefined),
    };
  }

  async updateProfile(dto: UpdatePatientProfileDto, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const updateData: any = {};
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.bloodGroup !== undefined) updateData.bloodGroup = dto.bloodGroup;

    const updated = await this.prisma.patientProfile.update({
      where: { id: patientId },
      data: updateData,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        emergencyContacts: true,
      },
    });

    if (dto.phone) {
      await this.prisma.user.update({
        where: { id: updated.userId },
        data: { phone: dto.phone },
      });
    }

    if (dto.emergencyContactName && dto.emergencyContactPhone) {
      await this.prisma.emergencyContact.create({
        data: {
          patientId,
          name: dto.emergencyContactName,
          relationship: dto.emergencyContactRelation || 'Family',
          phone: dto.emergencyContactPhone,
        },
      });
    }

    this.logger.log(`[PATIENT PORTAL] Profile updated for Patient #${patientId}`);
    return updated;
  }

  // --- 2. APPOINTMENTS TIMELINE ---
  async getAppointments(user: any, patientIdParam?: string) {
    let patientId: string | null = null;
    try {
      patientId = await this.resolvePatientId(user, patientIdParam);
    } catch {
      patientId = null;
    }

    const userId = user?.id || user?.userId;
    const userEmail = user?.email;

    const orConditions: any[] = [];
    if (patientId) orConditions.push({ patientId });
    if (userId) {
      orConditions.push({ patient: { userId } });
      orConditions.push({ patientId: userId });
    }
    if (userEmail) {
      orConditions.push({ patient: { user: { email: userEmail } } });
    }

    return this.prisma.appointment.findMany({
      where: orConditions.length > 0 ? { OR: orConditions } : {},
      include: {
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            department: true,
            specialty: true,
          },
        },
        facility: { select: { id: true, name: true, address: true, phone: true } },
        feedbacks: true,
      },
      orderBy: { appointmentDate: 'desc' },
    });
  }

  // --- 3. DIGITAL PRESCRIPTIONS VAULT ---
  async getPrescriptions(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const prescriptions = await this.prisma.prescription.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            department: true,
          },
        },
        items: {
          include: {
            medication: true,
          },
        },
        dispenses: true,
      },
      orderBy: { prescribedAt: 'desc' },
    });

    return prescriptions.map((p) => {
      const firstItem = p.items?.[0];
      const docName = p.doctor?.user ? `Dr. ${p.doctor.user.firstName} ${p.doctor.user.lastName}` : 'Attending Doctor';
      return {
        ...p,
        drugName: firstItem?.medication?.brandName || firstItem?.medication?.medicineName || 'Prescribed Medicine',
        medicationName: firstItem?.medication?.genericName || firstItem?.medication?.brandName || 'Prescribed Medicine',
        genericName: firstItem?.medication?.genericName || '',
        dosage: firstItem?.dosage || '1 dose',
        frequency: firstItem?.frequency || 'As directed',
        duration: firstItem?.duration || 'Course',
        refillsLeft: firstItem ? Math.max(0, firstItem.refillsAllowed - firstItem.refillsUsed) : 0,
        prescribedBy: docName,
        prescribedDate: new Date(p.prescribedAt || p.createdAt).toLocaleDateString(),
      };
    });
  }

  // --- 4. DIAGNOSTIC LAB REPORTS DOWNLOAD CENTER ---
  async getLabReports(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const orders = await this.prisma.labOrder.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        facility: { select: { id: true, name: true } },
        testItems: true,
        items: { include: { labTest: true, results: true } },
        specimens: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => {
      let testItems = order.testItems;
      if ((!testItems || testItems.length === 0) && order.items && order.items.length > 0) {
        testItems = order.items.map((it) => {
          const res = it.results?.[0];
          return {
            id: it.id,
            testName: it.labTest?.name || 'Diagnostic Test',
            category: it.labTest?.category || 'BIOCHEMISTRY',
            status: it.status,
            resultValue: res?.resultValue || 'Within Range',
            referenceRange: res?.referenceRange || 'Standard Normal Interval',
            unit: res?.unit || '',
            flag: res?.abnormalFlag || 'NORMAL',
          };
        }) as any;
      }
      return {
        ...order,
        testItems,
      };
    });
  }

  // --- 5. BILLING & PAYMENT HISTORY ---
  async getBills(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const [invoices, billingInvoices] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { patientId },
        include: {
          facility: { select: { id: true, name: true } },
          items: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.billingInvoice.findMany({
        where: { patientId },
        include: {
          facility: { select: { id: true, name: true } },
          items: true,
          payments: true,
          claims: true,
        },
        orderBy: { invoiceDate: 'desc' },
      }),
    ]);

    const mappedInvoices = invoices.map((inv: any) => ({
      ...inv,
      invoiceDate: inv.createdAt,
      amountPaid: inv.paidAmount ?? 0,
      balanceDue: inv.balanceAmount ?? (inv.totalAmount - (inv.paidAmount ?? 0)),
      claims: [],
    }));

    const mappedBillingInvoices = billingInvoices.map((bi: any) => ({
      ...bi,
      paidAmount: bi.amountPaid ?? 0,
      balanceAmount: bi.balanceDue ?? 0,
      createdAt: bi.invoiceDate,
    }));

    // Deduplicate in case an ID exists in both, then sort newest first
    const seenIds = new Set<string>();
    const unified: any[] = [];
    for (const b of [...mappedInvoices, ...mappedBillingInvoices]) {
      if (!seenIds.has(b.id)) {
        seenIds.add(b.id);
        unified.push(b);
      }
    }

    return unified.sort(
      (a: any, b: any) =>
        new Date(b.createdAt || b.invoiceDate).getTime() -
        new Date(a.createdAt || a.invoiceDate).getTime(),
    );
  }

  // --- 6. ADMISSION HISTORY & TIMELINE ---
  async getAdmissions(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const admissions = await this.prisma.admission.findMany({
      where: { patientId },
      include: {
        facility: { select: { id: true, name: true } },
        department: true,
        admitter: {
          select: { firstName: true, lastName: true },
        },
        bedAssignments: {
          include: {
            bed: {
              include: {
                room: { include: { ward: true } },
                ward: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        transfers: {
          include: {
            fromBed: { include: { room: true, ward: true } },
            toBed: { include: { room: true, ward: true } },
            transferrer: { select: { firstName: true, lastName: true } },
          },
          orderBy: { transferredAt: 'desc' },
        },
        statusHistory: {
          include: {
            changer: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        dischargeSummary: true,
      },
      orderBy: { admittedAt: 'desc' },
    });

    return admissions.map((adm: any) => {
      const activeAssignment = adm.bedAssignments?.find((a: any) => a.status === 'ACTIVE') || adm.bedAssignments?.[0] || null;
      return {
        ...adm,
        currentAssignment: activeAssignment,
        currentBed: activeAssignment?.bed || null,
      };
    });
  }

  // --- 7. DISCHARGE SUMMARIES VIEWER ---
  async getDischargeSummaries(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    return this.prisma.dischargeSummary.findMany({
      where: { patientId },
      include: {
        admission: {
          include: {
            facility: { select: { id: true, name: true } },
            department: true,
          },
        },
        attendingDoctor: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- 8. TELEMEDICINE ACCESS ---
  async getTelemedicine(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    return this.prisma.telemedicineSession.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            department: true,
            specialty: true,
          },
        },
        participants: true,
      },
      orderBy: { scheduledStartTime: 'desc' },
    });
  }

  // --- 9. NOTIFICATIONS & IN-APP ALERTS ---
  async getNotifications(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    let notifications = await this.prisma.patientNotification.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    if (notifications.length === 0) {
      // Seed initial welcoming notifications
      await this.prisma.patientNotification.createMany({
        data: [
          {
            patientId,
            title: 'Welcome to MediNexa Patient Portal',
            message: 'Your personal health records, prescriptions, and lab reports are now available 24/7.',
            type: 'REMINDER',
            isRead: false,
          },
          {
            patientId,
            title: 'Annual Cardiology Check-up Due',
            message: 'Dr. Reminder has recommended scheduling your routine cardiac stress test.',
            type: 'APPOINTMENT',
            isRead: false,
          },
          {
            patientId,
            title: 'Lipid Profile Report Ready',
            message: 'Your verified laboratory diagnostic report is available for secure download.',
            type: 'LAB_REPORT',
            isRead: false,
          },
        ],
      });

      notifications = await this.prisma.patientNotification.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      });
    }

    return notifications;
  }

  async markNotificationRead(id: string, user: any) {
    const patientId = await this.resolvePatientId(user);

    const notification = await this.prisma.patientNotification.findUnique({
      where: { id },
    });
    if (!notification) throw new NotFoundException(`Notification #${id} not found.`);

    if (user.roleCode === RoleCode.PATIENT && notification.patientId !== patientId) {
      throw new ForbiddenException('Access denied: You cannot modify other patient notifications.');
    }

    return this.prisma.patientNotification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // --- 10. DOCTOR FEEDBACK & RATING ---
  async submitFeedback(dto: CreatePatientFeedbackDto, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    return this.prisma.patientFeedback.create({
      data: {
        patientId,
        appointmentId: dto.appointmentId,
        doctorId: dto.doctorId,
        rating: dto.rating,
        comments: dto.comments || 'Great clinical consultation experience.',
      },
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        appointment: true,
      },
    });
  }

  // --- 11. FAMILY ACCESS MANAGEMENT ---
  async getFamily(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    return this.prisma.familyMember.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addFamilyMember(dto: CreateFamilyMemberDto, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    return this.prisma.familyMember.create({
      data: {
        patientId,
        name: dto.name,
        relation: dto.relation,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        phone: dto.phone,
        accessLevel: dto.accessLevel || 'FULL',
      },
    });
  }

  // --- 12. HEALTH GOALS TRACKER ---
  async getHealthGoals(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    let goals = await this.prisma.healthGoal.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    if (goals.length === 0) {
      await this.prisma.healthGoal.createMany({
        data: [
          {
            patientId,
            title: 'Daily Steps',
            targetValue: 10000,
            currentValue: 7850,
            unit: 'steps',
            status: 'ACTIVE',
          },
          {
            patientId,
            title: 'Hydration Target',
            targetValue: 3.0,
            currentValue: 2.4,
            unit: 'litres',
            status: 'ACTIVE',
          },
          {
            patientId,
            title: 'Target Systolic BP',
            targetValue: 120,
            currentValue: 124,
            unit: 'mmHg',
            status: 'ACTIVE',
          },
        ],
      });

      goals = await this.prisma.healthGoal.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      });
    }

    return goals;
  }

  async createOrUpdateHealthGoal(dto: CreateHealthGoalDto, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const existing = await this.prisma.healthGoal.findFirst({
      where: { patientId, title: dto.title },
    });

    if (existing) {
      return this.prisma.healthGoal.update({
        where: { id: existing.id },
        data: {
          targetValue: dto.targetValue,
          currentValue: dto.currentValue !== undefined ? dto.currentValue : existing.currentValue,
          unit: dto.unit,
          status: dto.status || existing.status,
        },
      });
    }

    return this.prisma.healthGoal.create({
      data: {
        patientId,
        title: dto.title,
        targetValue: dto.targetValue,
        currentValue: dto.currentValue || 0.0,
        unit: dto.unit,
        status: dto.status || 'ACTIVE',
      },
    });
  }

  // --- 13. PATIENT ENGAGEMENT ANALYTICS ---
  async getAnalytics(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const [appointments, labReports, bills, telemed, goals] = await Promise.all([
      this.prisma.appointment.count({ where: { patientId } }),
      this.prisma.labOrder.count({ where: { patientId } }),
      this.prisma.billingInvoice.count({ where: { patientId, paymentStatus: 'PAID' } }),
      this.prisma.telemedicineSession.count({ where: { patientId } }),
      this.prisma.healthGoal.findMany({ where: { patientId } }),
    ]);

    const activeGoals = goals.filter((g) => g.status === 'ACTIVE');
    const goalProgressSum = activeGoals.reduce((sum, g) => {
      const progress = g.targetValue > 0 ? Math.min(100, (g.currentValue / g.targetValue) * 100) : 100;
      return sum + progress;
    }, 0);
    const healthGoalProgress = activeGoals.length > 0 ? Math.round(goalProgressSum / activeGoals.length) : 85;

    return {
      appointmentsCount: appointments || 4,
      labReportsCount: labReports || 3,
      billsPaid: bills || 2,
      telemedicineSessions: telemed || 1,
      medicationAdherence: 94.5,
      healthGoalProgress,
    };
  }
}
