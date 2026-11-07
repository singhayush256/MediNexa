import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RoleCode } from '@medinexa/types';
import { UpdatePatientProfileDto } from './dto/update-profile.dto';
import { CreatePatientFeedbackDto } from './dto/create-feedback.dto';
import { CreateFamilyMemberDto, UpdateFamilyMemberDto } from './dto/create-family-member.dto';
import { CreateHealthGoalDto } from './dto/create-health-goal.dto';
import { CreatePatientInsuranceDto, UpdatePatientInsuranceDto } from './dto/insurance.dto';
import { ChangePasswordDto, AccountDeleteRequestDto } from './dto/change-password.dto';

@Injectable()
export class PatientPortalService {
  private readonly logger = new Logger(PatientPortalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async resolvePatientId(user: any, requestedPatientId?: string): Promise<string> {
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
          const uhid = userRec.patientId || `UHID-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
          profile = await this.prisma.patientProfile.create({
            data: {
              userId: userRec.id,
              gender: 'NOT_SPECIFIED',
              dateOfBirth: new Date('2000-01-01'),
              bloodGroup: 'UNKNOWN',
              phone: userRec.phone || null,
              address: JSON.stringify({
                uhid,
                currentAddress: { house: '', street: '', landmark: '', city: '', district: '', state: '', pinCode: '', country: 'India' },
                permanentAddress: { house: '', street: '', landmark: '', city: '', district: '', state: '', pinCode: '', country: 'India' },
                sameAsCurrent: true,
              }),
            },
          });
          this.logger.log(`[PATIENT PORTAL] Clean PatientProfile provisioned #${profile.id} for user ${userRec.email}`);
        }
      } catch (err) {
        this.logger.warn(`Could not provision patient profile: ${err}`);
      }
    }

    if (profile) {
      return profile.id;
    }

    // Staff / Admin lookup
    if (requestedPatientId) {
      const explicitProfile = await this.prisma.patientProfile.findFirst({
        where: { OR: [{ id: requestedPatientId }, { userId: requestedPatientId }] },
      });
      if (!explicitProfile) throw new NotFoundException(`Patient #${requestedPatientId} not found.`);
      return explicitProfile.id;
    }

    if (process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true') {
      throw new BadRequestException('Patient context (patientId) is required for staff access.');
    }

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
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
            medinexaPersonId: true,
            patientId: true,
            twoFactorEnabled: true,
            lastVerificationTime: true,
            createdAt: true,
            notificationPreference: true,
          },
        },
        emergencyContacts: true,
        patientInsurances: { include: { provider: true } },
        insurancePolicies: { include: { provider: true } },
        familyMembers: true,
        healthGoals: true,
        abhaProfile: true,
        allergies: true,
      },
    });

    if (!patient) throw new NotFoundException('Patient profile not found.');

    // Parse structured address safely
    let parsedAddressData: any = {
      currentAddress: { house: '', street: '', landmark: '', city: '', district: '', state: '', pinCode: '', country: 'India' },
      permanentAddress: { house: '', street: '', landmark: '', city: '', district: '', state: '', pinCode: '', country: 'India' },
      sameAsCurrent: true,
      rawAddress: '',
    };

    if (patient.address) {
      try {
        const parsed = JSON.parse(patient.address);
        if (parsed && typeof parsed === 'object') {
          parsedAddressData = {
            currentAddress: parsed.currentAddress || parsedAddressData.currentAddress,
            permanentAddress: parsed.permanentAddress || parsedAddressData.permanentAddress,
            sameAsCurrent: parsed.sameAsCurrent !== undefined ? parsed.sameAsCurrent : true,
            rawAddress: parsed.formatted || patient.address,
            preferredLanguage: parsed.preferredLanguage || 'English',
            medicalConditions: parsed.medicalConditions || [],
            pastSurgeries: parsed.pastSurgeries || [],
            familyMedicalHistory: parsed.familyMedicalHistory || [],
            longTermMedications: parsed.longTermMedications || [],
            allergiesText: parsed.allergiesText || '',
          };
        }
      } catch {
        parsedAddressData.rawAddress = patient.address;
      }
    }

    const uhid =
      patient.user?.patientId ||
      patient.user?.medinexaPersonId ||
      (parsedAddressData?.uhid) ||
      `UHID-${new Date(patient.createdAt).getFullYear()}-${patient.id.slice(0, 6).toUpperCase()}`;

    return {
      ...patient,
      uhid,
      medinexaPersonId: patient.user?.medinexaPersonId || uhid,
      addressData: parsedAddressData,
      notificationPreferences: patient.user?.notificationPreference || {
        emailEnabled: true,
        whatsappEnabled: true,
        appointmentReminders: true,
        medicationReminders: true,
        labReportAlerts: true,
      },
    };
  }

  async updateProfile(dto: UpdatePatientProfileDto, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const currentProfile = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { user: true, emergencyContacts: true },
    });

    if (!currentProfile) throw new NotFoundException('Patient profile not found.');

    const updateProfileData: any = {};
    if (dto.phone !== undefined) updateProfileData.phone = dto.phone;
    if (dto.gender !== undefined) updateProfileData.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) {
      try {
        updateProfileData.dateOfBirth = new Date(dto.dateOfBirth);
      } catch {}
    }
    if (dto.bloodGroup !== undefined) updateProfileData.bloodGroup = dto.bloodGroup;

    // Address & structured clinical preferences
    let existingMeta: any = {};
    if (currentProfile.address) {
      try {
        existingMeta = JSON.parse(currentProfile.address);
      } catch {}
    }

    const mergedAddressData: any = {
      ...existingMeta,
      uhid: existingMeta.uhid || currentProfile.user?.patientId,
    };

    if (dto.addressData) {
      mergedAddressData.currentAddress = dto.addressData.currentAddress || mergedAddressData.currentAddress;
      mergedAddressData.permanentAddress = dto.addressData.permanentAddress || mergedAddressData.permanentAddress;
      mergedAddressData.sameAsCurrent = dto.addressData.sameAsCurrent !== undefined ? dto.addressData.sameAsCurrent : mergedAddressData.sameAsCurrent;
    }

    if (dto.preferredLanguage) mergedAddressData.preferredLanguage = dto.preferredLanguage;
    if (dto.allergies !== undefined) mergedAddressData.allergiesText = dto.allergies;
    if (dto.medicalConditions !== undefined) mergedAddressData.medicalConditions = dto.medicalConditions;
    if (dto.pastSurgeries !== undefined) mergedAddressData.pastSurgeries = dto.pastSurgeries;
    if (dto.familyMedicalHistory !== undefined) mergedAddressData.familyMedicalHistory = dto.familyMedicalHistory;
    if (dto.longTermMedications !== undefined) mergedAddressData.longTermMedications = dto.longTermMedications;

    updateProfileData.address = JSON.stringify(mergedAddressData);

    const updated = await this.prisma.patientProfile.update({
      where: { id: patientId },
      data: updateProfileData,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        emergencyContacts: true,
      },
    });

    // Update User name & phone if provided
    const userUpdate: any = {};
    if (dto.firstName) userUpdate.firstName = dto.firstName;
    if (dto.lastName) userUpdate.lastName = dto.lastName;
    if (dto.phone) userUpdate.phone = dto.phone;
    if (Object.keys(userUpdate).length > 0) {
      await this.prisma.user.update({
        where: { id: updated.userId },
        data: userUpdate,
      });
    }

    // Emergency Contact
    if (dto.emergencyContactName && dto.emergencyContactPhone) {
      const existingEc = await this.prisma.emergencyContact.findFirst({
        where: { patientId },
      });
      if (existingEc) {
        await this.prisma.emergencyContact.update({
          where: { id: existingEc.id },
          data: {
            name: dto.emergencyContactName,
            relationship: dto.emergencyContactRelation || existingEc.relationship || 'Emergency Contact',
            phone: dto.emergencyContactPhone,
            email: dto.emergencyContactAltPhone || existingEc.email,
            address: dto.emergencyContactNotes || existingEc.address,
          },
        });
      } else {
        await this.prisma.emergencyContact.create({
          data: {
            patientId,
            name: dto.emergencyContactName,
            relationship: dto.emergencyContactRelation || 'Emergency Contact',
            phone: dto.emergencyContactPhone,
            email: dto.emergencyContactAltPhone || null,
            address: dto.emergencyContactNotes || null,
          },
        });
      }
    }

    // Patient Allergy record
    if (dto.allergies && dto.allergies.trim()) {
      const existingAllergy = await this.prisma.patientAllergy.findFirst({
        where: { patientId },
      });
      if (existingAllergy) {
        await this.prisma.patientAllergy.update({
          where: { id: existingAllergy.id },
          data: {
            allergen: dto.allergies,
            reaction: 'Patient Reported',
          },
        });
      } else {
        await this.prisma.patientAllergy.create({
          data: {
            patientId,
            allergen: dto.allergies,
            reaction: 'Patient Reported',
            severity: 'MODERATE' as any,
          },
        });
      }
    }

    // Notification Preferences
    if (dto.notificationPreferences) {
      const np = dto.notificationPreferences;
      await this.prisma.notificationPreference.upsert({
        where: { userId: updated.userId },
        create: {
          userId: updated.userId,
          emailEnabled: np.emailEnabled !== undefined ? np.emailEnabled : true,
          whatsappEnabled: np.whatsappEnabled !== undefined ? np.whatsappEnabled : true,
          appointmentReminders: np.appointmentReminders !== undefined ? np.appointmentReminders : true,
          medicationReminders: np.medicationReminders !== undefined ? np.medicationReminders : true,
          labReportAlerts: np.labReportAlerts !== undefined ? np.labReportAlerts : true,
        },
        update: {
          emailEnabled: np.emailEnabled,
          whatsappEnabled: np.whatsappEnabled,
          appointmentReminders: np.appointmentReminders,
          medicationReminders: np.medicationReminders,
          labReportAlerts: np.labReportAlerts,
        },
      });
    }

    this.logger.log(`[PATIENT PORTAL] Profile updated successfully for Patient #${patientId}`);
    return this.getProfile(user, patientIdParam);
  }

  // --- PASSWORD CHANGE ---
  async changePassword(dto: ChangePasswordDto, user: any) {
    const userId = user.id || user.userId;
    const userRec = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userRec) throw new NotFoundException('User account not found.');

    const isMatch = await bcrypt.compare(dto.oldPassword, userRec.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password entered is incorrect.');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    this.logger.log(`[SECURITY] Password changed successfully for user ${userRec.email}`);
    return { success: true, message: 'Password updated successfully.' };
  }

  // --- DATA EXPORT & DELETION REQUEST ---
  async exportData(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);
    const profile = await this.getProfile(user, patientIdParam);

    const [appointments, prescriptions, labs, bills, admissions, family, insurances] = await Promise.all([
      this.getAppointments(user, patientIdParam),
      this.getPrescriptions(user, patientIdParam),
      this.getLabReports(user, patientIdParam),
      this.getBills(user, patientIdParam),
      this.getAdmissions(user, patientIdParam),
      this.getFamily(user, patientIdParam),
      this.getInsurance(user, patientIdParam),
    ]);

    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        institution: 'MediNexa Connected Healthcare Platform',
        patientUhid: profile.uhid,
        complianceStandard: 'ABDM & GDPR Aligned Health Data Export',
      },
      profile,
      appointments,
      prescriptions,
      diagnosticLabReports: labs,
      billingHistory: bills,
      inpatientAdmissions: admissions,
      familyMembers: family,
      insurancePolicies: insurances,
    };
  }

  async requestAccountDeletion(dto: AccountDeleteRequestDto, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);
    const userId = user.id || user.userId;

    this.logger.warn(`[ACCOUNT DELETION REQUEST] Patient #${patientId} (${user.email}) requested deletion: ${dto.reason || 'None'}`);

    return {
      status: 'PENDING_REVIEW',
      requestId: `DEL-${Date.now().toString().slice(-8)}`,
      requestedAt: new Date().toISOString(),
      message: 'Your account deletion request has been registered under statutory healthcare retention regulations. Our compliance team will review your request within 7 business days.',
    };
  }

  // --- 1b. SETTINGS (ACCOUNT, PREFERENCES, NOTIFICATIONS, PRIVACY, EMERGENCY) ---
  async getSettings(user: any, patientIdParam?: string) {
    const profile = await this.getProfile(user, patientIdParam);
    const userId = user.id || user.userId || profile.userId;

    const notifPref = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    const parsedMeta = profile.addressData || {};

    return {
      account: {
        id: profile.id,
        userId,
        uhid: profile.uhid,
        firstName: profile.user?.firstName || '',
        lastName: profile.user?.lastName || '',
        email: profile.user?.email || user.email || '',
        phone: profile.phone || profile.user?.phone || '',
        accountStatus: profile.status || 'ACTIVE',
        createdAt: profile.createdAt,
      },
      preferences: {
        preferredLanguage: parsedMeta.preferredLanguage || 'English',
        preferredFacilityId: parsedMeta.preferredFacilityId || '',
        timezone: parsedMeta.timezone || 'Asia/Kolkata',
        dateFormat: parsedMeta.dateFormat || 'DD/MM/YYYY',
        theme: parsedMeta.theme || 'system',
      },
      notifications: {
        emailEnabled: notifPref?.emailEnabled ?? true,
        whatsappEnabled: notifPref?.whatsappEnabled ?? true,
        appointmentReminders: notifPref?.appointmentReminders ?? true,
        medicationReminders: notifPref?.medicationReminders ?? true,
        labReportAlerts: notifPref?.labReportAlerts ?? true,
        paymentReceipts: parsedMeta.notificationReceipts ?? true,
        admissionUpdates: parsedMeta.notificationAdmissionUpdates ?? true,
        emergencyAlerts: parsedMeta.notificationEmergencyAlerts ?? true,
      },
      privacyConsent: {
        dataSharingConsent: parsedMeta.dataSharingConsent ?? true,
        familyPermissionSharing: parsedMeta.familyPermissionSharing ?? true,
        documentSharingControl: parsedMeta.documentSharingControl ?? 'RESTRICTED',
      },
      emergencyInfo: {
        contactName: profile.emergencyContacts?.[0]?.name || '',
        relationship: profile.emergencyContacts?.[0]?.relationship || 'Family Member',
        phone: profile.emergencyContacts?.[0]?.phone || '',
        alternatePhone: (profile.emergencyContacts?.[0] as any)?.email || (profile.emergencyContacts?.[0] as any)?.alternatePhone || '',
        bloodGroup: profile.bloodGroup || 'B_POSITIVE',
        emergencyNotes: profile.emergencyContacts?.[0]?.address || parsedMeta.allergiesText || '',
      },
    };
  }

  async updateSettings(dto: any, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);
    const userId = user.id || user.userId;

    const currentProfile = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { user: true, emergencyContacts: true },
    });

    if (!currentProfile) throw new NotFoundException('Patient profile not found.');

    let existingMeta: any = {};
    if (currentProfile.address) {
      try {
        existingMeta = JSON.parse(currentProfile.address);
      } catch {}
    }

    if (dto.preferences) {
      if (dto.preferences.preferredLanguage) existingMeta.preferredLanguage = dto.preferences.preferredLanguage;
      if (dto.preferences.preferredFacilityId) existingMeta.preferredFacilityId = dto.preferences.preferredFacilityId;
      if (dto.preferences.timezone) existingMeta.timezone = dto.preferences.timezone;
      if (dto.preferences.dateFormat) existingMeta.dateFormat = dto.preferences.dateFormat;
      if (dto.preferences.theme) existingMeta.theme = dto.preferences.theme;
    }

    if (dto.privacyConsent) {
      if (dto.privacyConsent.dataSharingConsent !== undefined) existingMeta.dataSharingConsent = dto.privacyConsent.dataSharingConsent;
      if (dto.privacyConsent.familyPermissionSharing !== undefined) existingMeta.familyPermissionSharing = dto.privacyConsent.familyPermissionSharing;
      if (dto.privacyConsent.documentSharingControl !== undefined) existingMeta.documentSharingControl = dto.privacyConsent.documentSharingControl;
    }

    if (dto.notifications) {
      if (dto.notifications.paymentReceipts !== undefined) existingMeta.notificationReceipts = dto.notifications.paymentReceipts;
      if (dto.notifications.admissionUpdates !== undefined) existingMeta.notificationAdmissionUpdates = dto.notifications.admissionUpdates;
      if (dto.notifications.emergencyAlerts !== undefined) existingMeta.notificationEmergencyAlerts = dto.notifications.emergencyAlerts;

      await this.prisma.notificationPreference.upsert({
        where: { userId: currentProfile.userId },
        create: {
          userId: currentProfile.userId,
          emailEnabled: dto.notifications.emailEnabled ?? true,
          whatsappEnabled: dto.notifications.whatsappEnabled ?? true,
          appointmentReminders: dto.notifications.appointmentReminders ?? true,
          medicationReminders: dto.notifications.medicationReminders ?? true,
          labReportAlerts: dto.notifications.labReportAlerts ?? true,
        },
        update: {
          emailEnabled: dto.notifications.emailEnabled,
          whatsappEnabled: dto.notifications.whatsappEnabled,
          appointmentReminders: dto.notifications.appointmentReminders,
          medicationReminders: dto.notifications.medicationReminders,
          labReportAlerts: dto.notifications.labReportAlerts,
        },
      });
    }

    if (dto.emergencyInfo) {
      if (dto.emergencyInfo.bloodGroup) {
        await this.prisma.patientProfile.update({
          where: { id: patientId },
          data: { bloodGroup: dto.emergencyInfo.bloodGroup },
        });
      }

      if (dto.emergencyInfo.contactName && dto.emergencyInfo.phone) {
        const existingEc = await this.prisma.emergencyContact.findFirst({
          where: { patientId },
        });
        if (existingEc) {
          await this.prisma.emergencyContact.update({
            where: { id: existingEc.id },
            data: {
              name: dto.emergencyInfo.contactName,
              relationship: dto.emergencyInfo.relationship || existingEc.relationship,
              phone: dto.emergencyInfo.phone,
              email: dto.emergencyInfo.alternatePhone || existingEc.email,
              address: dto.emergencyInfo.emergencyNotes || existingEc.address,
            },
          });
        } else {
          await this.prisma.emergencyContact.create({
            data: {
              patientId,
              name: dto.emergencyInfo.contactName,
              relationship: dto.emergencyInfo.relationship || 'Emergency Contact',
              phone: dto.emergencyInfo.phone,
              email: dto.emergencyInfo.alternatePhone || null,
              address: dto.emergencyInfo.emergencyNotes || null,
            },
          });
        }
      }
    }

    await this.prisma.patientProfile.update({
      where: { id: patientId },
      data: { address: JSON.stringify(existingMeta) },
    });

    this.logger.log(`[PATIENT PORTAL] Settings updated for Patient #${patientId}`);
    return this.getSettings(user, patientIdParam);
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
    }
    if (userEmail) {
      orConditions.push({ patient: { user: { email: userEmail } } });
    }

    if (orConditions.length === 0) {
      return [];
    }

    return this.prisma.appointment.findMany({
      where: { OR: orConditions },
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
      // Seed ONLY a genuine welcoming notification for a brand new account
      await this.prisma.patientNotification.create({
        data: {
          patientId,
          title: 'Welcome to MediNexa Patient Portal',
          message: 'Your personal health account is ready. Book consultations, view medical records, and manage your health ecosystem 24/7.',
          type: 'REMINDER',
          isRead: false,
        },
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
        comments: dto.comments || 'Clinical consultation feedback recorded.',
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

    const list = await this.prisma.familyMember.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((m: any) => {
      let extra: any = {};
      if (m.email && m.email.startsWith('{')) {
        try { extra = JSON.parse(m.email); } catch {}
      }
      return {
        ...m,
        gender: extra.gender || 'OTHER',
        bloodGroup: extra.bloodGroup || 'UNKNOWN',
        allergies: extra.allergies || 'None recorded',
        emergencyContact: extra.emergencyContact || '',
      };
    });
  }

  async addFamilyMember(dto: CreateFamilyMemberDto, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const extra = JSON.stringify({
      gender: dto.gender || 'OTHER',
      bloodGroup: dto.bloodGroup || 'UNKNOWN',
      allergies: dto.allergies || '',
      emergencyContact: dto.emergencyContact || '',
    });

    return this.prisma.familyMember.create({
      data: {
        patientId,
        name: dto.name,
        relation: dto.relation,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        phone: dto.phone,
        email: extra,
        accessLevel: dto.accessLevel || 'FULL',
      },
    });
  }

  async updateFamilyMember(id: string, dto: UpdateFamilyMemberDto, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const existing = await this.prisma.familyMember.findFirst({
      where: { id, patientId },
    });
    if (!existing) throw new NotFoundException('Family member record not found.');

    let extra: any = {};
    if (existing.email && existing.email.startsWith('{')) {
      try { extra = JSON.parse(existing.email); } catch {}
    }

    if (dto.gender !== undefined) extra.gender = dto.gender;
    if (dto.bloodGroup !== undefined) extra.bloodGroup = dto.bloodGroup;
    if (dto.allergies !== undefined) extra.allergies = dto.allergies;
    if (dto.emergencyContact !== undefined) extra.emergencyContact = dto.emergencyContact;

    const updateData: any = { email: JSON.stringify(extra) };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.relation !== undefined) updateData.relation = dto.relation;
    if (dto.dob !== undefined) updateData.dob = dto.dob ? new Date(dto.dob) : null;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.accessLevel !== undefined) updateData.accessLevel = dto.accessLevel;

    return this.prisma.familyMember.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteFamilyMember(id: string, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const existing = await this.prisma.familyMember.findFirst({
      where: { id, patientId },
    });
    if (!existing) throw new NotFoundException('Family member record not found.');

    await this.prisma.familyMember.delete({ where: { id } });
    return { success: true, message: 'Family member removed successfully.' };
  }

  // --- 12. HEALTH INSURANCE MANAGEMENT ---
  async getInsurance(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const [policies, patientInsurances] = await Promise.all([
      this.prisma.insurancePolicy.findMany({
        where: { patientId },
        include: { provider: true, claims: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patientInsurance.findMany({
        where: { patientId },
        include: { provider: true, claims: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const unified: any[] = [];
    const seenNumbers = new Set<string>();

    for (const p of policies) {
      seenNumbers.add(p.policyNumber);
      unified.push({
        id: p.id,
        providerName: p.provider?.name || p.provider?.providerName || 'Insurance Provider',
        providerId: p.insuranceProviderId,
        policyholderName: (p as any).memberId || 'Self',
        policyNumber: p.policyNumber,
        memberId: p.memberId,
        policyType: p.insuranceType || 'CASHLESS',
        coverageAmount: p.coverageAmount || 0,
        utilizedAmount: p.utilizedAmount || 0,
        validFrom: p.validFrom ? p.validFrom.toISOString() : null,
        validTill: p.validTill.toISOString(),
        status: p.policyStatus || 'ACTIVE',
        claims: p.claims || [],
        createdAt: p.createdAt.toISOString(),
      });
    }

    for (const pi of patientInsurances) {
      if (!seenNumbers.has(pi.policyNumber)) {
        seenNumbers.add(pi.policyNumber);
        unified.push({
          id: pi.id,
          providerName: pi.provider?.name || pi.provider?.providerName || 'Insurance Provider',
          providerId: pi.insuranceProviderId,
          policyholderName: pi.memberId || 'Self',
          policyNumber: pi.policyNumber,
          memberId: pi.memberId,
          policyType: 'COMPREHENSIVE',
          coverageAmount: pi.coverageAmount || 0,
          utilizedAmount: 0,
          validFrom: pi.validFrom ? pi.validFrom.toISOString() : null,
          validTill: pi.validTill.toISOString(),
          status: pi.status || 'ACTIVE',
          claims: pi.claims || [],
          createdAt: pi.createdAt.toISOString(),
        });
      }
    }

    return unified;
  }

  async addInsurance(dto: CreatePatientInsuranceDto, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    // Find or create InsuranceProvider
    let provider = await this.prisma.insuranceProvider.findFirst({
      where: {
        OR: [
          { name: { equals: dto.providerName, mode: 'insensitive' } },
          { providerName: { equals: dto.providerName, mode: 'insensitive' } },
        ],
      },
    });

    if (!provider) {
      const code = `INS-${dto.providerName.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
      provider = await this.prisma.insuranceProvider.create({
        data: {
          name: dto.providerName,
          providerName: dto.providerName,
          code,
          providerCode: code,
          contactPhone: dto.customerSupportContact || null,
          contactDetails: dto.tpaDetails || null,
          active: true,
        },
      });
    }

    const coverage = dto.sumInsured !== undefined ? Number(dto.sumInsured) : dto.coverageAmount !== undefined ? Number(dto.coverageAmount) : 500000;
    const validFromDate = dto.validFrom ? new Date(dto.validFrom) : new Date();
    const validTillDate = new Date(dto.validTill);

    const created = await this.prisma.insurancePolicy.create({
      data: {
        patientId,
        insuranceProviderId: provider.id,
        policyNumber: dto.policyNumber,
        memberId: dto.memberId || dto.policyholderName || 'Self',
        coverageAmount: coverage,
        utilizedAmount: 0,
        validFrom: validFromDate,
        validTill: validTillDate,
        insuranceType: (dto.policyType === 'REIMBURSEMENT' ? 'REIMBURSEMENT' : 'CASHLESS') as any,
        policyStatus: 'ACTIVE' as any,
      },
      include: { provider: true },
    });

    this.logger.log(`[PATIENT PORTAL] Insurance policy #${created.policyNumber} added for Patient #${patientId}`);
    return this.getInsurance(user, patientIdParam);
  }

  async updateInsurance(id: string, dto: UpdatePatientInsuranceDto, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const policy = await this.prisma.insurancePolicy.findFirst({
      where: { id, patientId },
    });

    if (!policy) {
      // Check patientInsurance table
      const pi = await this.prisma.patientInsurance.findFirst({
        where: { id, patientId },
      });
      if (!pi) throw new NotFoundException('Insurance policy not found.');

      await this.prisma.patientInsurance.update({
        where: { id },
        data: {
          policyNumber: dto.policyNumber || pi.policyNumber,
          memberId: dto.memberId || pi.memberId,
          coverageAmount: dto.coverageAmount || dto.sumInsured || pi.coverageAmount,
          validTill: dto.validTill ? new Date(dto.validTill) : pi.validTill,
          status: dto.status || pi.status,
        },
      });
      return this.getInsurance(user, patientIdParam);
    }

    const updateData: any = {};
    if (dto.policyNumber) updateData.policyNumber = dto.policyNumber;
    if (dto.memberId) updateData.memberId = dto.memberId;
    if (dto.coverageAmount !== undefined || dto.sumInsured !== undefined) {
      updateData.coverageAmount = Number(dto.sumInsured || dto.coverageAmount);
    }
    if (dto.validFrom) updateData.validFrom = new Date(dto.validFrom);
    if (dto.validTill) updateData.validTill = new Date(dto.validTill);
    if (dto.status) updateData.policyStatus = dto.status as any;
    if (dto.policyType) updateData.insuranceType = dto.policyType as any;

    await this.prisma.insurancePolicy.update({
      where: { id },
      data: updateData,
    });

    return this.getInsurance(user, patientIdParam);
  }

  async deleteInsurance(id: string, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const policy = await this.prisma.insurancePolicy.findFirst({
      where: { id, patientId },
    });

    if (policy) {
      await this.prisma.insurancePolicy.delete({ where: { id } });
      return { success: true, message: 'Policy removed.' };
    }

    const pi = await this.prisma.patientInsurance.findFirst({
      where: { id, patientId },
    });
    if (pi) {
      await this.prisma.patientInsurance.delete({ where: { id } });
      return { success: true, message: 'Policy removed.' };
    }

    throw new NotFoundException('Insurance policy not found.');
  }

  async getInsuranceClaims(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    return this.prisma.insuranceClaim.findMany({
      where: { patientId },
      include: {
        provider: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- 13. DOCUMENTS & ATTACHMENTS REPOSITORY ---
  async getDocuments(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    const attachments = await this.prisma.fileAttachment.findMany({
      where: { patientId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: { select: { code: true } },
          },
        },
        facility: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return attachments.map((att: any) => ({
      ...att,
      isPatientUploaded: att.uploadedBy?.role?.code === 'PATIENT',
      uploaderName: `${att.uploadedBy?.firstName || ''} ${att.uploadedBy?.lastName || ''}`.trim() || 'User',
      facilityName: att.facility?.name || 'MediNexa Hospital',
    }));
  }

  async deleteDocument(id: string, user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);
    const userId = user.id || user.userId;

    const attachment = await this.prisma.fileAttachment.findFirst({
      where: { id, patientId },
      include: { uploadedBy: true },
    });

    if (!attachment) throw new NotFoundException('Medical document not found.');

    if (user.roleCode === 'PATIENT' && attachment.uploadedById !== userId) {
      throw new ForbiddenException('Patients cannot delete hospital clinical documents uploaded by staff.');
    }

    await this.prisma.fileAttachment.delete({ where: { id } });
    return { success: true, message: 'Document deleted successfully.' };
  }

  // --- 14. HEALTH GOALS TRACKER ---
  async getHealthGoals(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);

    return this.prisma.healthGoal.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
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

  // --- 15. PATIENT ENGAGEMENT ANALYTICS ---
  async getAnalytics(user: any, patientIdParam?: string) {
    const patientId = await this.resolvePatientId(user, patientIdParam);
    const now = new Date();

    const [
      appointments,
      upcomingAppointments,
      completedConsultations,
      labReports,
      prescriptions,
      activeReminders,
      vitalsCount,
      flowsheetCount,
      activeAdmissions,
      admissionsCount,
      dischargeSummaries,
      invoices,
      billingInvoices,
      goals,
      familyMembers,
      insurancePolicies,
      patientInsurances,
      documents,
      reminderHistories,
    ] = await Promise.all([
      this.prisma.appointment.count({ where: { patientId } }),
      this.prisma.appointment.count({
        where: {
          patientId,
          appointmentDate: { gte: now },
          status: { notIn: ['CANCELLED', 'NO_SHOW', 'COMPLETED'] },
        },
      }),
      this.prisma.appointment.count({
        where: {
          patientId,
          status: 'COMPLETED',
        },
      }),
      this.prisma.labOrder.count({ where: { patientId } }),
      this.prisma.prescription.count({ where: { patientId } }),
      this.prisma.medicationReminder.count({ where: { patientId, status: 'ACTIVE' } }),
      this.prisma.vitalSign.count({ where: { encounter: { patientId } } }),
      this.prisma.vitalsFlowsheet.count({ where: { patientId } }),
      this.prisma.admission.count({
        where: {
          patientId,
          status: { in: ['ADMITTED', 'TRANSFERRED', 'PLANNED'] },
        },
      }),
      this.prisma.admission.count({ where: { patientId } }),
      this.prisma.dischargeSummary.count({ where: { patientId } }),
      this.prisma.invoice.findMany({
        where: { patientId },
        select: { status: true, totalAmount: true, paidAmount: true, balanceAmount: true },
      }),
      this.prisma.billingInvoice.findMany({
        where: { patientId },
        select: { paymentStatus: true, totalAmount: true, amountPaid: true, balanceDue: true },
      }),
      this.prisma.healthGoal.findMany({ where: { patientId } }),
      this.prisma.familyMember.count({ where: { patientId } }),
      this.prisma.insurancePolicy.count({ where: { patientId, policyStatus: 'ACTIVE' } }),
      this.prisma.patientInsurance.count({ where: { patientId, status: 'ACTIVE' } }),
      this.prisma.fileAttachment.count({ where: { patientId } }),
      this.prisma.reminderHistory.findMany({
        where: { patientId },
        select: { action: true },
      }),
    ]);

    // Financial calculations
    let billsPaidCount = 0;
    let pendingBillsCount = 0;
    let pendingBillsAmount = 0;

    for (const inv of invoices) {
      if (inv.status === 'PAID') {
        billsPaidCount += 1;
      } else {
        pendingBillsCount += 1;
        const due = inv.balanceAmount ?? (inv.totalAmount - (inv.paidAmount ?? 0));
        pendingBillsAmount += Math.max(0, due);
      }
    }

    for (const bi of billingInvoices) {
      if (bi.paymentStatus === 'PAID') {
        billsPaidCount += 1;
      } else {
        pendingBillsCount += 1;
        pendingBillsAmount += Math.max(0, bi.balanceDue ?? 0);
      }
    }

    // Health Goal calculations
    const activeGoals = goals.filter((g) => g.status === 'ACTIVE');
    const healthGoalProgress =
      activeGoals.length > 0
        ? Math.round(
            activeGoals.reduce((sum, g) => {
              const prog = g.targetValue > 0 ? Math.min(100, (g.currentValue / g.targetValue) * 100) : 0;
              return sum + prog;
            }, 0) / activeGoals.length,
          )
        : 0;

    // Medication adherence calculation
    let medicationAdherence = 0;
    if (reminderHistories.length > 0) {
      const taken = reminderHistories.filter((h) => h.action === 'TAKEN').length;
      medicationAdherence = Math.round((taken / reminderHistories.length) * 100);
    }

    const recordedVitalsCount = vitalsCount + flowsheetCount;
    const totalHospitalVisits = completedConsultations + admissionsCount;
    const totalInsurancePolicies = insurancePolicies + patientInsurances;

    return {
      appointmentsCount: appointments,
      upcomingAppointmentsCount: upcomingAppointments,
      consultationsCount: completedConsultations,
      labReportsCount: labReports,
      prescriptionsCount: prescriptions,
      activeMedicinesCount: activeReminders,
      recordedVitalsCount: recordedVitalsCount,
      hospitalVisitsCount: totalHospitalVisits,
      activeAdmissionsCount: activeAdmissions,
      dischargeSummariesCount: dischargeSummaries,
      billsPaid: billsPaidCount,
      pendingBillsCount: pendingBillsCount,
      pendingBillsAmount: Math.round(pendingBillsAmount),
      insurancePoliciesCount: totalInsurancePolicies,
      familyMembersCount: familyMembers,
      documentsCount: documents,
      healthHistoryEntries: appointments + labReports + prescriptions + recordedVitalsCount + admissionsCount,
      telemedicineSessions: 0,
      medicationAdherence,
      healthGoalProgress,
    };
  }
}
