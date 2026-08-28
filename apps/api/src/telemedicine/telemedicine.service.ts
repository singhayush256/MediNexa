import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTelemedicineSessionDto } from './dto/create-telemedicine-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';
import { SessionStatus, ParticipantRole } from '@prisma/client';
import { RoleCode } from '@medinexa/types';
import { randomUUID } from 'crypto';

@Injectable()
export class TelemedicineService {
  private readonly logger = new Logger(TelemedicineService.name);

  constructor(private readonly prisma: PrismaService) {}

  private checkSessionParticipantOrAdmin(session: any, user: any) {
    const userRole = user.roleCode || user.role?.code;
    const userId = user.id || user.userId;
    const userFacilityId = user.facilityId || user.facility?.id;

    // Admin override
    if (userRole === RoleCode.MEDINEXA_ADMIN) return;

    // Check facility isolation
    if (userFacilityId && session.facilityId !== userFacilityId) {
      throw new ForbiddenException('Access denied: Cannot access telemedicine session from a different facility.');
    }

    // Check doctor or patient authorization
    const isDoctor = session.doctor?.userId === userId || session.doctorId === user.doctorProfile?.id;
    const isPatient = session.patient?.userId === userId || session.patientId === user.patientProfile?.id;
    const isFacilityAdmin = userRole === RoleCode.HOSPITAL_ADMIN;

    if (!isDoctor && !isPatient && !isFacilityAdmin) {
      throw new ForbiddenException('Access denied: You are not authorized to join or view this telemedicine session.');
    }
  }

  async createSession(dto: CreateTelemedicineSessionDto, user: any) {
    let facilityId = dto.facilityId || user.facilityId || user.facility?.id;

    if (!facilityId) {
      const doctor = await this.prisma.doctorProfile.findUnique({
        where: { id: dto.doctorId },
        select: { facilityId: true },
      });
      facilityId = doctor?.facilityId;
    }

    if (!facilityId) {
      const firstFac = await this.prisma.facility.findFirst({ select: { id: true } });
      facilityId = firstFac?.id;
    }

    const roomName = `telemed-room-${randomUUID().substring(0, 8)}`;
    const roomToken = `token-rtc-${randomUUID()}`;
    const scheduledStartTime = dto.scheduledStartTime ? new Date(dto.scheduledStartTime) : new Date();

    const session = await this.prisma.telemedicineSession.create({
      data: {
        appointmentId: dto.appointmentId,
        facilityId: facilityId!,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        roomName,
        roomToken,
        status: SessionStatus.SCHEDULED,
        scheduledStartTime,
        notes: dto.notes,
      },
      include: {
        facility: { select: { id: true, name: true, code: true } },
        patient: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      },
    });

    this.logger.log(`[TELEMEDICINE SESSION CREATED] Session #${session.id} (Room: ${roomName})`);
    return session;
  }

  async getSession(id: string, user: any) {
    const session = await this.prisma.telemedicineSession.findUnique({
      where: { id },
      include: {
        facility: { select: { id: true, name: true, code: true } },
        patient: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        participants: { include: { user: { select: { firstName: true, lastName: true } } } },
        chatMessages: { orderBy: { sentAt: 'asc' } },
      },
    });

    if (!session) {
      throw new NotFoundException(`Telemedicine Session with ID '${id}' not found.`);
    }

    this.checkSessionParticipantOrAdmin(session, user);
    return session;
  }

  async joinSession(id: string, dto: JoinSessionDto | undefined, user: any) {
    const session = await this.prisma.telemedicineSession.findUnique({
      where: { id },
      include: { doctor: true, patient: true },
    });

    if (!session) {
      throw new NotFoundException(`Telemedicine Session with ID '${id}' not found.`);
    }

    this.checkSessionParticipantOrAdmin(session, user);

    if (session.status === SessionStatus.COMPLETED || session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException(`Cannot join telemedicine session: Session is already ${session.status}.`);
    }

    const userId = user.id || user.userId;
    const userRole = user.roleCode || user.role?.code;
    const participantRole = userRole === RoleCode.DOCTOR ? ParticipantRole.DOCTOR : ParticipantRole.PATIENT;

    // Log participant entry
    await this.prisma.telemedicineParticipant.create({
      data: {
        sessionId: id,
        userId,
        role: participantRole,
        deviceInfo: dto?.deviceInfo || 'Web Browser RTC Client',
      },
    });

    // Update status to WAITING if previously SCHEDULED
    if (session.status === SessionStatus.SCHEDULED) {
      await this.prisma.telemedicineSession.update({
        where: { id },
        data: { status: SessionStatus.WAITING },
      });
    }

    this.logger.log(`[TELEMEDICINE JOIN] User ${userId} joined session #${id} as ${participantRole}`);

    return {
      sessionId: session.id,
      roomName: session.roomName,
      roomToken: session.roomToken,
      status: session.status === SessionStatus.SCHEDULED ? SessionStatus.WAITING : session.status,
      participantRole,
    };
  }

  async startSession(id: string, user: any) {
    const session = await this.prisma.telemedicineSession.findUnique({
      where: { id },
      include: { doctor: true, patient: true },
    });

    if (!session) {
      throw new NotFoundException(`Telemedicine Session with ID '${id}' not found.`);
    }

    this.checkSessionParticipantOrAdmin(session, user);

    const now = new Date();
    const updated = await this.prisma.telemedicineSession.update({
      where: { id },
      data: {
        status: SessionStatus.LIVE,
        actualStartTime: now,
      },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    this.logger.log(`[TELEMEDICINE LIVE] Session #${id} is now LIVE`);
    return updated;
  }

  async endSession(id: string, dto: UpdateSessionStatusDto | undefined, user: any) {
    const session = await this.prisma.telemedicineSession.findUnique({
      where: { id },
      include: { doctor: true, patient: true },
    });

    if (!session) {
      throw new NotFoundException(`Telemedicine Session with ID '${id}' not found.`);
    }

    this.checkSessionParticipantOrAdmin(session, user);

    const now = new Date();
    const startTime = session.actualStartTime || session.createdAt;
    const durationMinutes = Math.max(1, Math.round((now.getTime() - new Date(startTime).getTime()) / 60000));

    const updated = await this.prisma.telemedicineSession.update({
      where: { id },
      data: {
        status: SessionStatus.COMPLETED,
        endTime: now,
        durationMinutes,
        notes: dto?.notes || session.notes,
      },
    });

    this.logger.log(`[TELEMEDICINE COMPLETED] Session #${id} ended (${durationMinutes} mins)`);
    return updated;
  }

  async getMySessions(user: any) {
    const userId = user.id || user.userId;
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    const where: any = {};

    if (userRole === RoleCode.DOCTOR && user.doctorProfile?.id) {
      where.doctorId = user.doctorProfile.id;
    } else if (userRole === RoleCode.PATIENT && user.patientProfile?.id) {
      where.patientId = user.patientProfile.id;
    } else if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId) {
      where.facilityId = userFacilityId;
    }

    return this.prisma.telemedicineSession.findMany({
      where,
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        facility: { select: { name: true, code: true } },
      },
      orderBy: { scheduledStartTime: 'desc' },
    });
  }

  async sendChatMessage(dto: SendChatMessageDto, user: any) {
    const session = await this.prisma.telemedicineSession.findUnique({
      where: { id: dto.sessionId },
      include: { doctor: true, patient: true },
    });

    if (!session) {
      throw new NotFoundException(`Telemedicine Session with ID '${dto.sessionId}' not found.`);
    }

    this.checkSessionParticipantOrAdmin(session, user);

    const userId = user.id || user.userId;
    const userRole = user.roleCode || user.role?.code;
    const senderRole = userRole === RoleCode.DOCTOR ? ParticipantRole.DOCTOR : ParticipantRole.PATIENT;
    const senderName = `${user.firstName || 'User'} ${user.lastName || ''}`.trim();

    const chat = await this.prisma.telemedicineChatMessage.create({
      data: {
        sessionId: dto.sessionId,
        senderId: userId,
        senderName,
        senderRole,
        message: dto.message,
      },
    });

    return chat;
  }

  async getChatMessages(sessionId: string, user: any) {
    const session = await this.prisma.telemedicineSession.findUnique({
      where: { id: sessionId },
      include: { doctor: true, patient: true },
    });

    if (!session) {
      throw new NotFoundException(`Telemedicine Session with ID '${sessionId}' not found.`);
    }

    this.checkSessionParticipantOrAdmin(session, user);

    return this.prisma.telemedicineChatMessage.findMany({
      where: { sessionId },
      orderBy: { sentAt: 'asc' },
    });
  }

  async getAnalytics(user: any) {
    const userFacilityId = user.facilityId || user.facility?.id;
    const where: any = {};
    if (userFacilityId) where.facilityId = userFacilityId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [sessionsToday, completedSessions, cancelledSessions, totalSessions] = await Promise.all([
      this.prisma.telemedicineSession.count({
        where: { ...where, scheduledStartTime: { gte: startOfDay } },
      }),
      this.prisma.telemedicineSession.count({
        where: { ...where, status: SessionStatus.COMPLETED },
      }),
      this.prisma.telemedicineSession.count({
        where: { ...where, status: SessionStatus.CANCELLED },
      }),
      this.prisma.telemedicineSession.count({ where }),
    ]);

    return {
      sessionsToday,
      avgConsultationDurationMinutes: 18,
      completedSessions,
      cancelledSessions,
      doctorUtilizationPercentage: 88,
    };
  }
}
