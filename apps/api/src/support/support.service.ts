import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as nodeCrypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RoleCode } from '@medinexa/types';

export interface CreateSupportTicketDto {
  category: 'TECHNICAL' | 'CLINICAL_SYSTEMS' | 'BILLING_INVOICE' | 'HARDWARE_EQUIPMENT' | 'ONBOARDING';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  subject: string;
  description: string;
  facilityId?: string;
  attachmentUrls?: string[];
}

export interface TicketMessageDto {
  message: string;
}

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);
  private tickets = new Map<string, any>();
  private ticketCounter = 1000;

  constructor(private readonly prisma: PrismaService) {
    this.seedBaselineTickets();
  }

  private seedBaselineTickets() {
    const seed = {
      id: 'TICK-2026-1001',
      ticketNumber: 'TICK-2026-1001',
      facilityId: 'fac-hosp-a',
      facilityName: 'MediNexa General Hospital (Hospital A)',
      createdByUserId: 'usr-admin-a',
      createdByName: 'Dr. Sunita Singh',
      role: 'HOSPITAL_ADMIN',
      category: 'TECHNICAL',
      priority: 'HIGH',
      subject: 'DICOM PACS viewer gateway latency in Radiology',
      description: 'Radiology workstation reporting 4-5s delay when retrieving high-resolution multi-slice CT series.',
      status: 'IN_PROGRESS',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      messages: [
        {
          id: 'msg-1',
          senderName: 'Dr. Sunita Singh',
          role: 'HOSPITAL_ADMIN',
          message: 'Initial report: 4-5s latency during morning OPD imaging rush.',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: 'msg-2',
          senderName: 'MediNexa DevOps Engineering',
          role: 'SUPER_ADMIN',
          message: 'Under investigation: Local cache pre-fetch worker allocated to facility node.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
    };
    this.tickets.set(seed.id, seed);
  }

  async createTicket(dto: CreateSupportTicketDto, user: any) {
    if (!dto.subject?.trim() || !dto.description?.trim()) {
      throw new BadRequestException('Ticket subject and detailed description are required.');
    }

    const facilityId = dto.facilityId || user.facilityId || 'fac-default';
    this.ticketCounter++;
    const ticketId = `TICK-${new Date().getFullYear()}-${this.ticketCounter}`;

    const newTicket = {
      id: ticketId,
      ticketNumber: ticketId,
      facilityId,
      facilityName: user.facility?.name || 'Healthcare Facility',
      createdByUserId: user.id,
      createdByName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Staff Member',
      role: user.roleCode || user.role?.code || 'STAFF',
      category: dto.category || 'TECHNICAL',
      priority: dto.priority || 'MEDIUM',
      subject: dto.subject.trim(),
      description: dto.description.trim(),
      attachmentUrls: dto.attachmentUrls || [],
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${nodeCrypto.randomUUID().slice(0, 8)}`,
          senderName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Staff Member',
          role: user.roleCode || user.role?.code || 'STAFF',
          message: dto.description.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
    };

    this.tickets.set(ticketId, newTicket);

    await this.prisma.auditEvent.create({
      data: {
        facilityId,
        userId: user.id,
        role: user.roleCode || 'STAFF',
        action: 'SUPPORT_TICKET_CREATED',
        resource: 'SUPPORT_TICKET',
        details: JSON.stringify({ ticketId, category: dto.category, priority: dto.priority }),
      },
    }).catch(() => null);

    this.logger.log(`🎫 [SUPPORT TICKET] #${ticketId} created by ${user.email} (Facility: ${facilityId})`);
    return newTicket;
  }

  async getTickets(user: any, facilityId?: string) {
    const userRole = user.roleCode || user.role?.code;
    const isSuperAdmin = userRole === RoleCode.MEDINEXA_ADMIN || userRole === 'SUPER_ADMIN';

    let allTickets = Array.from(this.tickets.values());

    if (!isSuperAdmin) {
      const userFacilityId = user.facilityId || user.doctorProfile?.facilityId || user.facility?.id;
      allTickets = allTickets.filter((t) => t.facilityId === userFacilityId);
    } else if (facilityId) {
      allTickets = allTickets.filter((t) => t.facilityId === facilityId);
    }

    allTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return allTickets;
  }

  async getTicketById(id: string, user: any) {
    const ticket = this.tickets.get(id);
    if (!ticket) {
      throw new NotFoundException(`Support ticket '${id}' not found.`);
    }

    const userRole = user.roleCode || user.role?.code;
    const isSuperAdmin = userRole === RoleCode.MEDINEXA_ADMIN || userRole === 'SUPER_ADMIN';

    if (!isSuperAdmin) {
      const userFacilityId = user.facilityId || user.doctorProfile?.facilityId || user.facility?.id;
      if (ticket.facilityId !== userFacilityId) {
        throw new ForbiddenException('Access denied: You cannot view support tickets belonging to another hospital facility.');
      }
    }

    return ticket;
  }

  async addMessage(ticketId: string, dto: TicketMessageDto, user: any) {
    const ticket = await this.getTicketById(ticketId, user);
    if (!dto.message?.trim()) {
      throw new BadRequestException('Message body cannot be empty.');
    }

    const msg = {
      id: `msg-${nodeCrypto.randomUUID().slice(0, 8)}`,
      senderName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Support Agent',
      role: user.roleCode || user.role?.code || 'STAFF',
      message: dto.message.trim(),
      timestamp: new Date().toISOString(),
    };

    ticket.messages.push(msg);
    ticket.updatedAt = new Date().toISOString();

    if (ticket.status === 'RESOLVED') {
      ticket.status = 'IN_PROGRESS';
    }

    return ticket;
  }

  async updateStatus(ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED', user: any) {
    const ticket = await this.getTicketById(ticketId, user);
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();

    if (status === 'RESOLVED' || status === 'CLOSED') {
      ticket.resolvedAt = new Date().toISOString();
    }

    return ticket;
  }

  getKnowledgeBase() {
    return [
      {
        role: 'HOSPITAL_ADMIN',
        title: 'Facility Multi-Branch & Staff Governance',
        sections: [
          'How to invite clinical employees and configure RBAC roles',
          'Configuring OPD slot timings and Consultation Fee structures',
          'Managing SaaS Tier upgrades and GST invoice downloads',
        ],
      },
      {
        role: 'DOCTOR',
        title: 'Clinical Encounter & CDSS Guide',
        sections: [
          'Documenting Chief Complaints & ICD-10 Differential Diagnoses',
          'Issuing e-Prescriptions with Food Timings and Drug-Drug Interaction Alerts',
          'Ordering Stat Diagnostics and reviewing verified lab reports',
        ],
      },
      {
        role: 'NURSE',
        title: 'Bedside Vitals & MAR Flowsheet Operations',
        sections: [
          'Logging Continuous Flowsheet Vitals (BP, SpO2, Heart Rate)',
          'Verifying Medication Administration Schedule and signing MAR',
          'Initiating Ward Transfer and Bed Release Sanitization',
        ],
      },
      {
        role: 'PHARMACIST',
        title: 'FEFO Inventory & Dispensing Protocol',
        sections: [
          'Verifying Physician Prescriptions against Physical Stock',
          'Tracking Drug Expiry Batches and Low-Stock Safety Thresholds',
          'Reconciling Inpatient Medication Kits with Cashier Billing',
        ],
      },
    ];
  }
}
