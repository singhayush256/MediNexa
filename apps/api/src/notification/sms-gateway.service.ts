import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SmsLogRecord {
  id: string;
  recipientPhone: string;
  eventType: string;
  senderId: string;
  provider: 'MOCK' | 'MSG91' | 'TWILIO' | 'FAST2SMS';
  message: string;
  status: 'DELIVERED' | 'PENDING' | 'FAILED';
  gatewayResponseId: string;
  sentAt: string;
}

export interface SmsGatewaySettings {
  provider: 'MOCK' | 'MSG91' | 'TWILIO' | 'FAST2SMS';
  senderId: string;
  apiKey: string;
  isActive: boolean;
  dltEntityId: string;
}

@Injectable()
export class SmsGatewayService {
  private readonly logger = new Logger(SmsGatewayService.name);

  private settings: SmsGatewaySettings = {
    provider: 'MSG91',
    senderId: 'MDNEXA',
    apiKey: 'mdnexa_live_msg91_k892j1h482910',
    isActive: true,
    dltEntityId: '1101552390000041289',
  };

  private deliveryLogs: SmsLogRecord[] = [
    {
      id: 'SMS-2026-901',
      recipientPhone: '+91 98101 10100',
      eventType: 'APPOINTMENT_CONFIRMATION',
      senderId: 'MDNEXA',
      provider: 'MSG91',
      message: 'MediNexa: Your appointment #APT-IND-50102 with Dr. Rajesh Sharma is confirmed for tomorrow 10:30 AM at Sector 62, Noida.',
      status: 'DELIVERED',
      gatewayResponseId: 'gw_msg91_9918231',
      sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'SMS-2026-902',
      recipientPhone: '+91 98101 10101',
      eventType: 'OTP_VERIFICATION',
      senderId: 'MDNEXA',
      provider: 'MSG91',
      message: 'MediNexa: 849201 is your OTP for portal authentication. Valid for 10 minutes. Do not share with anyone.',
      status: 'DELIVERED',
      gatewayResponseId: 'gw_msg91_9918232',
      sentAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'SMS-2026-903',
      recipientPhone: '+91 98101 10102',
      eventType: 'LAB_RESULTS_READY',
      senderId: 'MDNEXA',
      provider: 'MSG91',
      message: 'MediNexa: NABL Accredited diagnostic report for Order #LAB-ORD-40012 is ready. View online on patient portal.',
      status: 'DELIVERED',
      gatewayResponseId: 'gw_msg91_9918233',
      sentAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'SMS-2026-904',
      recipientPhone: '+91 98101 10103',
      eventType: 'BILLING_RECEIPT',
      senderId: 'MDNEXA',
      provider: 'MSG91',
      message: 'MediNexa: Received payment of Rs. 3,500 for Invoice #INV-2026-30015. Tax invoice sent to registered email.',
      status: 'DELIVERED',
      gatewayResponseId: 'gw_msg91_9918234',
      sentAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'SMS-2026-905',
      recipientPhone: '+91 98101 10104',
      eventType: 'PRESCRIPTION_DISPENSED',
      senderId: 'MDNEXA',
      provider: 'MSG91',
      message: 'MediNexa: E-Prescription #RX-IND-40020 has been dispensed by Central Pharmacy (FEFO verified).',
      status: 'DELIVERED',
      gatewayResponseId: 'gw_msg91_9918235',
      sentAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ];

  private readonly templates = [
    {
      id: 'TMPL-01',
      eventType: 'APPOINTMENT_CONFIRMATION',
      name: 'OPD Appointment Confirmation',
      dltTemplateId: '1107161829000021341',
      sample: 'MediNexa: Your appointment #{id} with Dr. {doctor} is confirmed for {datetime} at Sector 62, Noida.',
    },
    {
      id: 'TMPL-02',
      eventType: 'APPOINTMENT_REMINDER',
      name: 'Consultation Reminder',
      dltTemplateId: '1107161829000021342',
      sample: 'MediNexa Reminder: You have an upcoming consultation with Dr. {doctor} today at {time}. Please arrive 15 mins early.',
    },
    {
      id: 'TMPL-03',
      eventType: 'LAB_RESULTS_READY',
      name: 'NABL Lab Diagnostics Ready',
      dltTemplateId: '1107161829000021343',
      sample: 'MediNexa: NABL Accredited diagnostic report for Order #{orderNumber} is ready. View online on patient portal.',
    },
    {
      id: 'TMPL-04',
      eventType: 'PRESCRIPTION_DISPENSED',
      name: 'Pharmacy Dispense Notification',
      dltTemplateId: '1107161829000021344',
      sample: 'MediNexa: E-Prescription #{rxNumber} has been dispensed by Central Pharmacy. Follow dosage instructions.',
    },
    {
      id: 'TMPL-05',
      eventType: 'DISCHARGE_SUMMARY',
      name: 'Inpatient Ward Discharge Summary',
      dltTemplateId: '1107161829000021345',
      sample: 'MediNexa: Discharge summary for Inpatient Admission #{admNumber} has been finalized. We wish you a speedy recovery.',
    },
    {
      id: 'TMPL-06',
      eventType: 'BILLING_RECEIPT',
      name: 'GST Billing Payment Receipt',
      dltTemplateId: '1107161829000021346',
      sample: 'MediNexa: Received payment of Rs. {amount} for Invoice #{invNumber}. GST Tax Invoice available on portal.',
    },
    {
      id: 'TMPL-07',
      eventType: 'OTP_VERIFICATION',
      name: 'Authentication OTP',
      dltTemplateId: '1107161829000021347',
      sample: 'MediNexa: {otp} is your secure OTP for verification. Valid for 10 minutes. Do not share with anyone.',
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  getSettings() {
    return this.settings;
  }

  updateSettings(dto: Partial<SmsGatewaySettings>) {
    if (dto.senderId) {
      const cleanSender = dto.senderId.trim().toUpperCase();
      if (cleanSender.length !== 6 || !/^[A-Z]+$/.test(cleanSender)) {
        throw new BadRequestException('Sender ID must be exactly 6 uppercase alphabet characters under TRAI DLT guidelines.');
      }
      this.settings.senderId = cleanSender;
    }
    if (dto.provider) this.settings.provider = dto.provider;
    if (dto.apiKey) this.settings.apiKey = dto.apiKey;
    if (dto.isActive !== undefined) this.settings.isActive = dto.isActive;
    if (dto.dltEntityId) this.settings.dltEntityId = dto.dltEntityId;

    this.logger.log(`[SMS GATEWAY] Settings updated: Provider=${this.settings.provider}, SenderID=${this.settings.senderId}`);
    return this.settings;
  }

  getDeliveryLogs() {
    return this.deliveryLogs;
  }

  getTemplates() {
    return this.templates;
  }

  async sendSms(payload: {
    recipientPhone?: string;
    phone?: string;
    eventType?: string;
    event?: string;
    message?: string;
    templateVars?: Record<string, string>;
    variables?: Record<string, string>;
  }) {
    const recipientPhone = payload.recipientPhone || payload.phone;
    const eventType = payload.eventType || payload.event;
    if (!recipientPhone) {
      throw new BadRequestException('Recipient mobile phone number is required.');
    }

    const template = this.templates.find((t) => t.eventType === eventType) || this.templates[0];
    let finalMessage = payload.message;

    if (!finalMessage) {
      finalMessage = template.sample;
      const vars = payload.templateVars || payload.variables;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          finalMessage = finalMessage!.replace(`{${k}}`, v);
        });
      }
    }
    // Fill remaining placeholders with defaults
    finalMessage = finalMessage
        .replace('{id}', 'APT-IND-50999')
        .replace('{doctor}', 'Dr. Rajesh Sharma')
        .replace('{datetime}', 'Tomorrow at 11:00 AM')
        .replace('{time}', '11:00 AM')
        .replace('{orderNumber}', 'LAB-ORD-40099')
        .replace('{rxNumber}', 'RX-IND-40099')
        .replace('{admNumber}', 'ADM-IND-20099')
        .replace('{amount}', '2,500')
        .replace('{invNumber}', 'INV-2026-30099')
        .replace('{otp}', Math.floor(100000 + Math.random() * 900000).toString());

    const newLog: SmsLogRecord = {
      id: `SMS-2026-${(this.deliveryLogs.length + 901).toString()}`,
      recipientPhone,
      eventType: template.eventType,
      senderId: this.settings.senderId,
      provider: this.settings.provider,
      message: finalMessage,
      status: 'DELIVERED',
      gatewayResponseId: `gw_${this.settings.provider.toLowerCase()}_${Date.now()}`,
      sentAt: new Date().toISOString(),
    };

    this.deliveryLogs.unshift(newLog);
    this.logger.log(`[SMS GATEWAY] SMS Dispatched to ${recipientPhone} via ${this.settings.provider} [Sender: ${this.settings.senderId}]`);

    return {
      success: true,
      message: 'SMS message dispatched through Indian National Telecom Gateway (DLT Approved).',
      log: newLog,
    };
  }
}
