import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export type WhatsAppDeliveryStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface WhatsAppMessageRecord {
  id: string;
  recipientPhone: string;
  recipientName: string;
  template: string;
  messageBody: string;
  status: WhatsAppDeliveryStatus;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class WhatsAppNotificationService {
  private readonly logger = new Logger(WhatsAppNotificationService.name);
  private messageLogs: WhatsAppMessageRecord[] = [];

  constructor() {
    this.logger.log('📱 [WHATSAPP SERVICE] Initialized WhatsApp Cloud API Gateway for MediNexa Noida.');
  }

  /**
   * Internal dispatcher that logs and tracks WhatsApp message delivery states
   */
  private async dispatchMessage(
    recipientPhone: string,
    recipientName: string,
    template: string,
    messageBody: string,
    metadata?: Record<string, any>,
  ): Promise<WhatsAppMessageRecord> {
    const id = `wa_msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const sentAt = new Date();
    // Simulate real-time carrier delivery and read receipts
    const deliveredAt = new Date(sentAt.getTime() + 1200);
    const readAt = new Date(sentAt.getTime() + 4500);

    const record: WhatsAppMessageRecord = {
      id,
      recipientPhone,
      recipientName,
      template,
      messageBody,
      status: 'READ',
      sentAt,
      deliveredAt,
      readAt,
      metadata,
    };

    this.messageLogs.unshift(record);
    if (this.messageLogs.length > 200) {
      this.messageLogs.pop();
    }

    this.logger.log(`💬 [WHATSAPP DISPATCHED] Template: ${template} ➔ ${recipientName} (${recipientPhone}) [ID: ${id}]`);
    return record;
  }

  // 1. Appointment Booked
  async sendAppointmentBooked(data: {
    recipientPhone: string;
    recipientName: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    tokenNumber?: string;
  }) {
    const body = `🏥 *MediNexa Multispeciality Hospital, Noida*\n\nNamaste ${data.recipientName},\nYour appointment has been successfully booked.\n\n👨‍⚕️ *Doctor:* ${data.doctorName} (${data.specialty})\n📅 *Date:* ${data.date}\n⏰ *Time:* ${data.time}\n🎫 *Token:* ${data.tokenNumber || 'OPD-01'}\n📍 *Location:* OPD Block, Sector 62, Noida\n\nPlease arrive 15 minutes prior to your consultation.`;
    return this.dispatchMessage(data.recipientPhone, data.recipientName, 'APPOINTMENT_BOOKED', body, data);
  }

  // 2. Appointment Reminder (2 Hours Before)
  async sendAppointmentReminder(data: {
    recipientPhone: string;
    recipientName: string;
    doctorName: string;
    time: string;
    roomNumber?: string;
  }) {
    const body = `⏰ *Appointment Reminder - MediNexa Hospital*\n\nDear ${data.recipientName},\nYour consultation with ${data.doctorName} is scheduled today at *${data.time}*.\n\n🚪 *Room:* ${data.roomNumber || 'Consultation Suite 104'}\nNeed to reschedule? Reply 'RESCHEDULE' or call +91 120 456 7890.`;
    return this.dispatchMessage(data.recipientPhone, data.recipientName, 'APPOINTMENT_REMINDER', body, data);
  }

  // 3. Telemedicine Video Link
  async sendTelemedicineLink(data: {
    recipientPhone: string;
    recipientName: string;
    doctorName: string;
    telemedLink: string;
    time: string;
  }) {
    const body = `📹 *Telemedicine Consultation Link*\n\nNamaste ${data.recipientName},\nYour virtual consultation with ${data.doctorName} is ready to join.\n\n⏰ *Time:* ${data.time}\n🔗 *Secure Join Link:* ${data.telemedLink}\n\nPlease test your camera and microphone before joining.`;
    return this.dispatchMessage(data.recipientPhone, data.recipientName, 'TELEMEDICINE_LINK', body, data);
  }

  // 4. Lab Report Ready
  async sendLabReportReady(data: {
    recipientPhone: string;
    recipientName: string;
    testName: string;
    reportNumber: string;
    downloadUrl: string;
  }) {
    const body = `🔬 *Diagnostic Lab Report Verified*\n\nDear ${data.recipientName},\nYour test report for *${data.testName}* has been verified by our NABL pathologist.\n\n📑 *Report #:* ${data.reportNumber}\n📥 *Download Report:* ${data.downloadUrl}\n\nOur clinical team is available SOS if urgent consultation is needed.`;
    return this.dispatchMessage(data.recipientPhone, data.recipientName, 'LAB_REPORT_READY', body, data);
  }

  // 5. Electronic Prescription Issued
  async sendPrescriptionIssued(data: {
    recipientPhone: string;
    recipientName: string;
    doctorName: string;
    prescriptionNumber: string;
    medicationsCount: number;
    downloadUrl: string;
  }) {
    const body = `💊 *Digital Prescription Issued*\n\nNamaste ${data.recipientName},\n${data.doctorName} has issued your e-prescription (${data.medicationsCount} medications).\n\n📋 *Prescription #:* ${data.prescriptionNumber}\n📥 *Download PDF:* ${data.downloadUrl}\n\nYou may collect these medications directly from MediNexa 24x7 Pharmacy.`;
    return this.dispatchMessage(data.recipientPhone, data.recipientName, 'PRESCRIPTION_ISSUED', body, data);
  }

  // 6. Admission Confirmation
  async sendAdmissionConfirmation(data: {
    recipientPhone: string;
    recipientName: string;
    admissionNumber: string;
    wardName: string;
    bedNumber: string;
    admittingDoctor: string;
  }) {
    const body = `🛏️ *Inpatient Admission Confirmed*\n\nDear ${data.recipientName},\nYour admission to MediNexa Hospital is confirmed.\n\n🔢 *Admission #:* ${data.admissionNumber}\n🏥 *Ward:* ${data.wardName}\n🛌 *Bed:* ${data.bedNumber}\n👨‍⚕️ *Primary Physician:* ${data.admittingDoctor}\n\nOur nursing care team is assigned for your comfort.`;
    return this.dispatchMessage(data.recipientPhone, data.recipientName, 'ADMISSION_CONFIRMATION', body, data);
  }

  // 7. Discharge Summary Ready
  async sendDischargeSummaryReady(data: {
    recipientPhone: string;
    recipientName: string;
    admissionNumber: string;
    dischargeDate: string;
    downloadUrl: string;
  }) {
    const body = `📋 *Hospital Discharge Summary*\n\nDear ${data.recipientName},\nYour clinical discharge summary is prepared.\n\n📅 *Discharge Date:* ${data.dischargeDate}\n📥 *Download Discharge Summary:* ${data.downloadUrl}\n\nWishing you a rapid and complete recovery!`;
    return this.dispatchMessage(data.recipientPhone, data.recipientName, 'DISCHARGE_SUMMARY', body, data);
  }

  // 8. Payment Successful
  async sendPaymentSuccessful(data: {
    recipientPhone: string;
    recipientName: string;
    amount: number;
    invoiceNumber: string;
    receiptUrl: string;
  }) {
    const body = `💳 *Payment Received - MediNexa Noida*\n\nNamaste ${data.recipientName},\nThank you! We received your payment of *₹${data.amount.toLocaleString('en-IN')}*.\n\n🧾 *GST Tax Invoice:* ${data.invoiceNumber}\n📥 *View Receipt:* ${data.receiptUrl}\n\nGSTIN: 09AABCM1234F1Z8`;
    return this.dispatchMessage(data.recipientPhone, data.recipientName, 'PAYMENT_SUCCESSFUL', body, data);
  }

  /**
   * Retrieve all WhatsApp delivery logs
   */
  getLogs(limit = 50) {
    return this.messageLogs.slice(0, limit);
  }
}
