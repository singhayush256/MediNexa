import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly defaultFrom = process.env.SMTP_FROM || 'MediNexa Healthcare <notifications@medinexa.health>';

  constructor(private readonly prisma: PrismaService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`📧 [EMAIL SERVICE] Configured SMTP Transport via ${host}:${port}`);
    } else {
      this.logger.log('📧 [EMAIL SERVICE] SMTP credentials not fully configured. Using simulated delivery with audit logging.');
    }
  }

  private wrapHospitalTemplate(title: string, contentHtml: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; }
    .wrapper { width: 100%; max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f766e 0%, #0369a1 100%); padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.85; }
    .body-content { padding: 28px 24px; font-size: 15px; line-height: 1.6; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 18px 0; }
    .card-row { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px; }
    .card-label { font-weight: 600; color: #64748b; font-size: 13px; }
    .card-val { font-weight: 600; color: #0f172a; font-size: 14px; text-align: right; }
    .button-container { text-align: center; margin: 24px 0 12px 0; }
    .btn { display: inline-block; background-color: #0d9488; color: #ffffff !important; text-decoration: none; padding: 12px 28px; font-weight: 600; font-size: 14px; border-radius: 6px; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2); }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: #e0f2fe; color: #0369a1; }
    .badge-urgent { background-color: #fee2e2; color: #b91c1c; }
    .badge-success { background-color: #dcfce7; color: #15803d; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
    .footer a { color: #0d9488; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>MediNexa Healthcare OS</h1>
      <p>Continuous Clinical Intelligence & Patient Care</p>
    </div>
    <div class="body-content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} MediNexa Healthcare Systems. All rights reserved.</p>
      <p>This is an automated clinical notification. If you did not expect this message, please contact our 24x7 helpline.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private async dispatchEmail(
    to: string,
    subject: string,
    html: string,
    notificationType: string,
    metadata?: Record<string, any>,
  ): Promise<EmailSendResult> {
    const title = subject;
    try {
      let messageId = `sim_email_${Date.now()}`;
      let previewUrl: string | undefined;

      if (this.transporter) {
        const info = await this.transporter.sendMail({
          from: this.defaultFrom,
          to,
          subject,
          html,
        });
        messageId = info.messageId;
        previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      }

      this.logger.log(`📧 [EMAIL SENT] [${notificationType}] To: ${to} | Subject: "${subject}" | MsgId: ${messageId}`);

      await this.prisma.notificationDeliveryLog.create({
        data: {
          recipient: to,
          channel: 'EMAIL',
          notificationType,
          title,
          message: subject,
          status: 'SENT',
          sentAt: new Date(),
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        },
      });

      return { success: true, messageId, previewUrl };
    } catch (err: any) {
      this.logger.error(`❌ [EMAIL ERROR] Failed to send to ${to}: ${err.message}`, err.stack);

      await this.prisma.notificationDeliveryLog.create({
        data: {
          recipient: to,
          channel: 'EMAIL',
          notificationType,
          title,
          message: subject,
          status: 'FAILED',
          failureReason: err.message,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        },
      });

      return { success: false, error: err.message };
    }
  }

  // 1. Appointment Confirmation Email
  async sendAppointmentConfirmation(data: {
    recipientEmail: string;
    recipientName: string;
    doctorName: string;
    specialty: string;
    appointmentDate: string;
    appointmentTime: string;
    facilityName?: string;
    appointmentNumber?: string;
  }): Promise<EmailSendResult> {
    const subject = `Appointment Confirmed: Dr. ${data.doctorName} on ${data.appointmentDate}`;
    const contentHtml = `
      <h2>Appointment Confirmed</h2>
      <p>Namaste <strong>${data.recipientName}</strong>,</p>
      <p>Your appointment has been confirmed with the clinical team at <strong>${data.facilityName || 'MediNexa Super Speciality Hospital'}</strong>.</p>
      
      <div class="card">
        <div class="card-row">
          <span class="card-label">Doctor</span>
          <span class="card-val">Dr. ${data.doctorName} (${data.specialty})</span>
        </div>
        <div class="card-row">
          <span class="card-label">Date</span>
          <span class="card-val">${data.appointmentDate}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Time</span>
          <span class="card-val">${data.appointmentTime}</span>
        </div>
        <div class="card-row" style="border-bottom: none;">
          <span class="card-label">Reference #</span>
          <span class="card-val">${data.appointmentNumber || 'MED-' + Math.floor(100000 + Math.random() * 900000)}</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #64748b;">
        Please arrive 15 minutes before your scheduled consultation for vitals check-in. Bring your previous medical records and current medications.
      </p>

      <div class="button-container">
        <a href="http://localhost:3000/portal/appointments" class="btn">View Appointment Details</a>
      </div>
    `;

    const html = this.wrapHospitalTemplate(subject, contentHtml);
    return this.dispatchEmail(data.recipientEmail, subject, html, 'APPOINTMENT_CONFIRMED', data);
  }

  // 2. 24-Hour Appointment Reminder Email
  async sendAppointmentReminder24h(data: {
    recipientEmail: string;
    recipientName: string;
    doctorName: string;
    specialty: string;
    appointmentDate: string;
    appointmentTime: string;
    facilityName?: string;
    roomNumber?: string;
  }): Promise<EmailSendResult> {
    const subject = `Reminder: Upcoming Appointment Tomorrow with Dr. ${data.doctorName}`;
    const contentHtml = `
      <div style="margin-bottom: 12px;"><span class="badge">24-Hour Reminder</span></div>
      <h2>Tomorrow's Consultation Reminder</h2>
      <p>Dear <strong>${data.recipientName}</strong>,</p>
      <p>This is a gentle reminder for your consultation scheduled for tomorrow with Dr. ${data.doctorName}.</p>
      
      <div class="card">
        <div class="card-row">
          <span class="card-label">Doctor</span>
          <span class="card-val">Dr. ${data.doctorName} (${data.specialty})</span>
        </div>
        <div class="card-row">
          <span class="card-label">Date & Time</span>
          <span class="card-val">${data.appointmentDate} at ${data.appointmentTime}</span>
        </div>
        <div class="card-row" style="border-bottom: none;">
          <span class="card-label">Location / Room</span>
          <span class="card-val">${data.roomNumber || 'Consultation Suite 204'}, ${data.facilityName || 'MediNexa Hospital'}</span>
        </div>
      </div>

      <div class="button-container">
        <a href="http://localhost:3000/portal/appointments" class="btn">Confirm / Reschedule</a>
      </div>
    `;

    const html = this.wrapHospitalTemplate(subject, contentHtml);
    return this.dispatchEmail(data.recipientEmail, subject, html, 'APPOINTMENT_REMINDER', data);
  }

  // 3. 2-Hour Appointment Reminder Email
  async sendAppointmentReminder2h(data: {
    recipientEmail: string;
    recipientName: string;
    doctorName: string;
    appointmentTime: string;
    roomNumber?: string;
  }): Promise<EmailSendResult> {
    const subject = `Urgent Reminder: Consultation with Dr. ${data.doctorName} in 2 Hours`;
    const contentHtml = `
      <div style="margin-bottom: 12px;"><span class="badge badge-urgent">Starting in 2 Hours</span></div>
      <h2>Consultation in 2 Hours</h2>
      <p>Dear <strong>${data.recipientName}</strong>,</p>
      <p>Dr. ${data.doctorName} will be ready to see you today at <strong>${data.appointmentTime}</strong>.</p>
      
      <div class="card">
        <div class="card-row">
          <span class="card-label">Time</span>
          <span class="card-val">${data.appointmentTime}</span>
        </div>
        <div class="card-row" style="border-bottom: none;">
          <span class="card-label">Room / Desk</span>
          <span class="card-val">${data.roomNumber || 'OPD Desk 12, Block A'}</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #64748b;">
        If you are experiencing transit delays or require assistance, please inform the reception desk upon entry.
      </p>
    `;

    const html = this.wrapHospitalTemplate(subject, contentHtml);
    return this.dispatchEmail(data.recipientEmail, subject, html, 'APPOINTMENT_REMINDER', data);
  }

  // 4. Medication Reminder Email
  async sendMedicationReminder(data: {
    recipientEmail: string;
    recipientName: string;
    medicineName: string;
    dosage: string;
    doseTime: string;
    beforeMeal?: boolean;
    instructions?: string;
  }): Promise<EmailSendResult> {
    const subject = `Medication Reminder: Time to take ${data.medicineName} (${data.dosage})`;
    const mealLabel = data.beforeMeal ? 'Before Meal' : 'After Meal';
    const contentHtml = `
      <div style="margin-bottom: 12px;"><span class="badge badge-success">Prescription Schedule</span></div>
      <h2>Time for Your Medicine</h2>
      <p>Hello <strong>${data.recipientName}</strong>,</p>
      <p>It is time to take your scheduled dose as prescribed by your care physician.</p>
      
      <div class="card">
        <div class="card-row">
          <span class="card-label">Medicine</span>
          <span class="card-val" style="color: #0d9488; font-size: 16px;">${data.medicineName}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Dosage</span>
          <span class="card-val">${data.dosage}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Scheduled Time</span>
          <span class="card-val">${data.doseTime}</span>
        </div>
        <div class="card-row" style="border-bottom: none;">
          <span class="card-label">Instructions</span>
          <span class="card-val">${mealLabel}${data.instructions ? ' • ' + data.instructions : ''}</span>
        </div>
      </div>

      <div class="button-container">
        <a href="http://localhost:3000/portal/medications" class="btn">Log Medicine as Taken</a>
      </div>
    `;

    const html = this.wrapHospitalTemplate(subject, contentHtml);
    return this.dispatchEmail(data.recipientEmail, subject, html, 'MEDICATION_REMINDER', data);
  }

  // 5. Lab Report Ready Email
  async sendLabReportReady(data: {
    recipientEmail: string;
    recipientName: string;
    testName: string;
    reportNumber: string;
    downloadUrl?: string;
  }): Promise<EmailSendResult> {
    const subject = `Diagnostic Report Ready: ${data.testName}`;
    const contentHtml = `
      <div style="margin-bottom: 12px;"><span class="badge badge-success">Verified by Pathologist</span></div>
      <h2>Your Diagnostic Results Are Ready</h2>
      <p>Dear <strong>${data.recipientName}</strong>,</p>
      <p>Your diagnostic laboratory test <strong>${data.testName}</strong> has been completed and verified by our clinical pathology team.</p>
      
      <div class="card">
        <div class="card-row">
          <span class="card-label">Test Name</span>
          <span class="card-val">${data.testName}</span>
        </div>
        <div class="card-row" style="border-bottom: none;">
          <span class="card-label">Report Number</span>
          <span class="card-val">${data.reportNumber}</span>
        </div>
      </div>

      <div class="button-container">
        <a href="${data.downloadUrl || 'http://localhost:3000/portal/reports'}" class="btn">View & Download Report</a>
      </div>
    `;

    const html = this.wrapHospitalTemplate(subject, contentHtml);
    return this.dispatchEmail(data.recipientEmail, subject, html, 'LAB_REPORT_AVAILABLE', data);
  }
}
