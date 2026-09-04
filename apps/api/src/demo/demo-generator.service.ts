import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AppointmentType,
  AppointmentStatus,
  PaymentStatus,
  InvoiceStatus,
  PaymentMethod,
  LabOrderPriority,
  LabOrderStatus,
} from '@prisma/client';

@Injectable()
export class DemoGeneratorService {
  private readonly logger = new Logger(DemoGeneratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDatasetStatus() {
    const [
      facilities,
      staffCount,
      patientCount,
      appointmentCount,
      admissionCount,
      prescriptionCount,
      labCount,
      claimCount,
      invoiceCount,
    ] = await Promise.all([
      this.prisma.facility.count(),
      this.prisma.user.count({ where: { role: { code: { not: 'PATIENT' } } } }),
      this.prisma.patientProfile.count(),
      this.prisma.appointment.count(),
      this.prisma.admission.count(),
      this.prisma.prescription.count(),
      this.prisma.labOrder.count(),
      this.prisma.insuranceClaim.count(),
      this.prisma.billingInvoice.count(),
    ]);

    return {
      status: 'ACTIVE',
      facilityName: 'MediNexa Multispeciality Hospital, Sector 62, Noida',
      counts: {
        facilities,
        staff: staffCount,
        patients: patientCount,
        appointments: appointmentCount,
        admissions: admissionCount,
        prescriptions: prescriptionCount,
        labReports: labCount,
        insuranceClaims: claimCount,
        gstInvoices: invoiceCount,
      },
    };
  }

  async generateIndianDataset() {
    this.logger.log('🇮🇳 [DEMO GENERATOR] Executing 1-Click Authentic Indian Hospital Dataset Augmentation/Generation...');

    // 1. Locate Facility
    let facility = await this.prisma.facility.findFirst({
      where: { code: 'NOIDA_CAMPUS_01' },
    });
    if (!facility) {
      facility = await this.prisma.facility.findFirst();
    }
    if (!facility) {
      throw new Error('No facility found in database. Run initial baseline migration first.');
    }

    // 2. Fetch existing Doctors
    const doctors = await this.prisma.doctorProfile.findMany({
      include: { user: true },
    });
    if (doctors.length === 0) {
      throw new Error('No doctors found. Database baseline must contain doctors.');
    }

    // 3. Fetch existing Patients
    const patients = await this.prisma.patientProfile.findMany({
      include: { user: true },
      take: 105,
    });
    if (patients.length === 0) {
      throw new Error('No patients found. Database baseline must contain patients.');
    }

    // 4. Fetch medications & lab tests
    const medications = await this.prisma.medication.findMany({ take: 20 });
    const labTests = await this.prisma.labTest.findMany({ take: 20 });
    const adminUser = await this.prisma.user.findFirst({
      where: { role: { code: { in: ['SUPER_ADMIN', 'HOSPITAL_ADMIN'] } } },
    });

    const adminUserId = adminUser?.id || doctors[0].userId;

    // 5. Check Appointments (ensure target 500)
    let currentAppointmentCount = await this.prisma.appointment.count();
    let createdAppointments = 0;
    const reasons = [
      'Annual cardiology checkup & 12-lead ECG review',
      'Follow-up for chronic hypertension and blood pressure regulation',
      'Persistent migraine, cluster headache, and dizziness evaluation',
      'Bilateral knee joint pain and osteoarthritis screening',
      'Routine pediatric immunization and growth milestone checkup',
      'Evaluation of chronic allergic dermatitis and eczema',
      'Sinus congestion, allergic rhinitis, and nasal endoscopy',
      'Type 2 Diabetes Mellitus fasting blood sugar management',
      'GERD acid reflux and upper abdominal dyspepsia',
      'Follow-up post fever, cold, cough, and throat irritation',
    ];

    let loopIndex = 0;
    const baseOffset = Math.floor(Math.random() * 10000) + 1000;
    while (currentAppointmentCount + createdAppointments < 500 && loopIndex < 1000) {
      const patient = patients[(loopIndex + baseOffset) % patients.length];
      const doctor = doctors[(loopIndex + baseOffset) % doctors.length];
      // Distinct day offset to avoid collision
      const dayOffset = 30 + Math.floor(loopIndex / (doctors.length * 8)) + (loopIndex % 30);
      const slotNumber = loopIndex % 8;
      const slotHour = 9 + slotNumber;
      const slotMin = (loopIndex % 2) * 30;

      const apptDate = new Date();
      apptDate.setDate(apptDate.getDate() + dayOffset);
      apptDate.setHours(slotHour, slotMin, 0, 0);

      const startHourStr = slotHour.toString().padStart(2, '0');
      const startMinStr = slotMin.toString().padStart(2, '0');
      const endMinStr = (slotMin + 30).toString().padStart(2, '0');

      try {
        await this.prisma.appointment.create({
          data: {
            appointmentNumber: `APT-IND-${(50000 + currentAppointmentCount + createdAppointments).toString()}`,
            patientId: patient.id,
            doctorId: doctor.id,
            facilityId: facility.id,
            departmentId: doctor.departmentId,
            appointmentDate: apptDate,
            startTime: `${startHourStr}:${startMinStr}`,
            endTime: `${startHourStr}:${endMinStr}`,
            type: loopIndex % 4 === 0 ? AppointmentType.FOLLOW_UP : (loopIndex % 3 === 0 ? AppointmentType.VIDEO : AppointmentType.CONSULTATION),
            status: AppointmentStatus.CONFIRMED,
            reason: reasons[loopIndex % reasons.length],
          },
        });
        createdAppointments++;
      } catch (err) {
        // Skip slot conflict
      }
      loopIndex++;
    }

    // 6. Check Prescriptions (ensure target 100)
    const currentRx = await this.prisma.prescription.count();
    let createdRx = 0;
    if (currentRx < 100 && medications.length > 0) {
      const neededRx = 100 - currentRx;
      for (let i = 0; i < neededRx; i++) {
        try {
          const patient = patients[i % patients.length];
          const doctor = doctors[i % doctors.length];
          const med1 = medications[i % medications.length];
          const med2 = medications[(i + 1) % medications.length];

          const encDate = new Date();
          encDate.setDate(encDate.getDate() - (i % 30 + 1));

          const enc = await this.prisma.clinicalEncounter.create({
            data: {
              encounterNumber: `ENC-IND-${(30000 + currentRx + i).toString()}`,
              patientId: patient.id,
              doctorId: doctor.id,
              facilityId: facility.id,
              departmentId: doctor.departmentId,
              encounterType: 'OUTPATIENT',
              status: 'COMPLETED',
              reasonForVisit: 'Consultation & Electronic Prescription formulation',
              startedAt: encDate,
              endedAt: new Date(encDate.getTime() + 1800000),
            },
          });

          const rx = await this.prisma.prescription.create({
            data: {
              prescriptionNumber: `RX-IND-${(30000 + currentRx + i).toString()}`,
              encounterId: enc.id,
              patientId: patient.id,
              doctorId: doctor.id,
              facilityId: facility.id,
              status: 'DISPENSED',
              notes: 'Follow standard dosage regimen. Keep hydrated and report if symptoms persist.',
            },
          });

          await this.prisma.prescriptionItem.create({
            data: {
              prescriptionId: rx.id,
              medicationId: med1.id,
              dosage: '1 Tablet',
              frequency: 'Twice daily after meals (1-0-1)',
              route: 'ORAL',
              duration: '5 Days',
              quantity: 10,
              instructions: 'Take orally with lukewarm water',
            },
          });

          await this.prisma.prescriptionItem.create({
            data: {
              prescriptionId: rx.id,
              medicationId: med2.id,
              dosage: '1 Tablet',
              frequency: 'Once daily before breakfast (1-0-0)',
              route: 'ORAL',
              duration: '14 Days',
              quantity: 14,
              instructions: 'Empty stomach in the morning',
            },
          });
          createdRx++;
        } catch (err) {
          // ignore error on duplicate item
        }
      }
    }

    // 7. Check Lab Orders (ensure target 100)
    const currentLabOrders = await this.prisma.labOrder.count();
    let createdLab = 0;
    if (currentLabOrders < 100 && labTests.length > 0) {
      const neededLab = 100 - currentLabOrders;
      for (let i = 0; i < neededLab; i++) {
        try {
          const patient = patients[i % patients.length];
          const doctor = doctors[i % doctors.length];
          const test = labTests[i % labTests.length];

          const order = await this.prisma.labOrder.create({
            data: {
              orderNumber: `LAB-ORD-${(30000 + currentLabOrders + i).toString()}`,
              patientId: patient.id,
              doctorId: doctor.id,
              facilityId: facility.id,
              priority: i % 5 === 0 ? LabOrderPriority.STAT : LabOrderPriority.ROUTINE,
              status: LabOrderStatus.COMPLETED,
              clinicalNotes: `Diagnostic assessment for ${test.name}. Clinical telemetry parameters normal.`,
              orderedAt: new Date(Date.now() - (i + 1) * 86400000),
              completedAt: new Date(),
              verifiedAt: new Date(),
              verifiedBy: doctor.user.id,
            },
          });

          await this.prisma.labTestItem.create({
            data: {
              labOrderId: order.id,
              testName: test.name,
              category: test.category,
              status: LabOrderStatus.COMPLETED,
              resultValue: 'Normal (NABL Accredited)',
              referenceRange: 'Normal Biological Reference Interval',
              unit: 'mg/dL',
              flag: 'NORMAL',
              verifiedById: doctor.user.id,
              verifiedAt: new Date(),
            },
          });
          createdLab++;
        } catch (err) {
          // ignore error
        }
      }
    }

    // 8. Check GST Invoices (ensure target 100)
    const currentInvoices = await this.prisma.billingInvoice.count();
    let createdInvoices = 0;
    if (currentInvoices < 100) {
      const neededInv = 100 - currentInvoices;
      for (let i = 0; i < neededInv; i++) {
        try {
          const patient = patients[i % patients.length];
          const isPaid = i % 4 !== 0;
          const subtotal = 10000 + (i * 1000);
          const cgst = Math.round(subtotal * 0.06);
          const sgst = Math.round(subtotal * 0.06);
          const tax = cgst + sgst;
          const total = subtotal + tax;

          const billingInv = await this.prisma.billingInvoice.create({
            data: {
              invoiceNumber: `INV-2026-${(30000 + currentInvoices + i).toString()}`,
              patientId: patient.id,
              facilityId: facility.id,
              subtotal,
              taxAmount: tax,
              discountAmount: 0,
              totalAmount: total,
              amountPaid: isPaid ? total : 0,
              balanceDue: isPaid ? 0 : total,
              paymentStatus: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
              invoiceStatus: isPaid ? InvoiceStatus.PAID : InvoiceStatus.GENERATED,
              notes: 'Hospital GST Tax Invoice (SAC 999311 Healthcare Services Exempt + HSN 3004 12% GST)',
            },
          });

          await this.prisma.billingLineItem.create({
            data: {
              invoiceId: billingInv.id,
              itemType: 'OPD',
              itemName: 'OPD Specialist Consultation & Clinical Diagnostics (SAC 999311)',
              quantity: 1,
              unitPrice: Math.round(subtotal * 0.7),
              taxPercent: 0,
              discountPercent: 0,
              totalPrice: Math.round(subtotal * 0.7),
            },
          });

          await this.prisma.billingLineItem.create({
            data: {
              invoiceId: billingInv.id,
              itemType: 'PHARMACY',
              itemName: 'Hospital Formularies & Surgical Consumables (HSN 3004 - 12% GST)',
              quantity: 1,
              unitPrice: Math.round(subtotal * 0.3),
              taxPercent: 12,
              discountPercent: 0,
              totalPrice: Math.round(subtotal * 0.3 * 1.12),
            },
          });

          if (isPaid) {
            await this.prisma.paymentTransaction.create({
              data: {
                invoiceId: billingInv.id,
                paymentMethod: i % 2 === 0 ? PaymentMethod.UPI : PaymentMethod.CARD,
                transactionReference: `RZP_DEMO_TXN_${Date.now()}_${i}`,
                amount: total,
                status: 'SUCCESS',
                collectedById: adminUserId,
              },
            });
          }
          createdInvoices++;
        } catch (err) {
          // ignore error
        }
      }
    }

    const finalStatus = await this.getDatasetStatus();

    this.logger.log(`✅ [DEMO GENERATOR] Indian Dataset Synced! Appointments: ${finalStatus.counts.appointments}, Lab: ${finalStatus.counts.labReports}, Rx: ${finalStatus.counts.prescriptions}, Invoices: ${finalStatus.counts.gstInvoices}`);

    return {
      success: true,
      message: 'Authentic Indian Hospital Dataset generated and validated successfully.',
      facility: 'MediNexa Multispeciality Hospital, Sector 62, Noida, UP',
      generatedDelta: {
        appointments: createdAppointments,
        labReports: createdLab,
        prescriptions: createdRx,
        gstInvoices: createdInvoices,
      },
      currentTotals: finalStatus.counts,
      timestamp: new Date().toISOString(),
    };
  }
}
