import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BedStatusChangedEvent } from '@medinexa/types';
import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { ClinicalEventBusService } from '../../common/events/clinical-event-bus.service';
import { isAllowedCorsOrigin } from '../../common/utils/cors-origin.util';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: any) => {
      callback(null, isAllowedCorsOrigin(origin));
    },
    credentials: true,
  },
  namespace: '/events',
})
@Injectable()
export class BedGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  private readonly logger = new Logger(BedGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    @Optional() private readonly clinicalEventBus?: ClinicalEventBusService,
  ) {}

  onModuleInit() {
    if (this.clinicalEventBus) {
      this.clinicalEventBus.subscribe((event) => {
        try {
          if (!this.server) return;
          const { type, payload } = event;
          if (type === 'notification.created') {
            this.emitNotificationCreated(payload);
          } else if (type === 'bed.transfer.completed') {
            this.emitBedTransferCompleted(payload);
          } else if (type === 'bed.status.changed') {
            this.emitBedStatusChanged(payload);
          } else if (type === 'bed.occupancy.updated') {
            this.emitBedOccupancyUpdated(payload.facilityId, payload.stats);
          } else if (type === 'admission.created') {
            this.emitAdmissionCreated(payload);
          } else if (type === 'admission.discharged') {
            this.emitAdmissionDischarged(payload);
          } else if (type === 'appointment.updated') {
            this.emitAppointmentStatusChanged(payload);
          } else if (type === 'queue.updated') {
            this.emitQueueStatusChanged(payload);
          } else if (type === 'patient.registered.facility' || type === 'PATIENT_REGISTERED_AT_FACILITY') {
            this.emitPatientRegisteredAtFacility(payload);
          } else if (type === 'patient.profile.updated' || type === 'PATIENT_PROFILE_UPDATED') {
            this.emitPatientProfileUpdated(payload);
          }
        } catch (err: any) {
          this.logger.debug(`Real-time event forward error: ${err.message}`);
        }
      });
    }
  }

  afterInit(server: Server) {
    this.logger.log('📡 Real-time WebSocket Gateway initialized on namespace /events');
  }

  private extractAndVerifyUser(client: Socket): any {
    try {
      const rawToken =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization?.startsWith('Bearer ')
          ? client.handshake.headers.authorization.slice(7)
          : client.handshake.headers?.authorization) ||
        (client.handshake.query?.token as string);

      if (!rawToken) {
        return null;
      }

      const jwtSecret =
        process.env.JWT_SECRET || 'medinexa-dev-jwt-secret-key-change-in-production-day2';
      const decoded: any = jwt.verify(rawToken, jwtSecret);
      return decoded;
    } catch {
      return null;
    }
  }

  handleConnection(client: Socket) {
    const user = this.extractAndVerifyUser(client);
    if (user) {
      (client as any).user = user;
      const effectiveUserId = user.sub || user.id;
      if (effectiveUserId) {
        client.join(`user_${effectiveUserId}`);
      }
      if (user.facilityId) {
        client.join(`facility_${user.facilityId}`);
      }
    } else {
      // In non-production environments, allow development query params for local frontend mocking
      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) {
        const handshakeQuery = client.handshake.query;
        if (handshakeQuery.facilityId) client.join(`facility_${handshakeQuery.facilityId}`);
        if (handshakeQuery.userId) client.join(`user_${handshakeQuery.userId}`);
      }
    }
  }

  handleDisconnect(client: Socket) {
    // Socket automatically leaves rooms upon disconnection
  }

  @SubscribeMessage('join_facility')
  handleJoinFacility(@ConnectedSocket() client: Socket, @MessageBody() data: { facilityId: string }) {
    if (!data?.facilityId) return;

    const user = (client as any).user || this.extractAndVerifyUser(client);
    const isProduction = process.env.NODE_ENV === 'production';

    if (user) {
      const role = (user.roleCode || user.role || '').toUpperCase();
      const isCrossOrg = role === 'SUPER_ADMIN' || role === 'MEDINEXA_ADMIN';
      if (isCrossOrg || user.facilityId === data.facilityId) {
        client.join(`facility_${data.facilityId}`);
      } else {
        this.logger.warn(`[WEBSOCKET ISOLATION] Blocked unauthorized join_facility: User ${user.email} -> ${data.facilityId}`);
      }
    } else if (!isProduction) {
      client.join(`facility_${data.facilityId}`);
    } else {
      this.logger.warn(`[WEBSOCKET ISOLATION] Unauthenticated socket attempted to join facility: ${data.facilityId}`);
    }
  }

  @SubscribeMessage('join_user')
  handleJoinUser(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    if (!data?.userId) return;

    const user = (client as any).user || this.extractAndVerifyUser(client);
    const isProduction = process.env.NODE_ENV === 'production';

    if (user) {
      const currentUserId = user.sub || user.id;
      const role = (user.roleCode || user.role || '').toUpperCase();
      const isSuper = role === 'SUPER_ADMIN' || role === 'MEDINEXA_ADMIN';
      if (isSuper || currentUserId === data.userId) {
        client.join(`user_${data.userId}`);
      } else {
        this.logger.warn(`[WEBSOCKET ISOLATION] Blocked unauthorized join_user: User ${currentUserId} -> ${data.userId}`);
      }
    } else if (!isProduction) {
      client.join(`user_${data.userId}`);
    } else {
      this.logger.warn(`[WEBSOCKET ISOLATION] Unauthenticated socket attempted to join user room: ${data.userId}`);
    }
  }

  @SubscribeMessage('join_role')
  handleJoinRole(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { facilityId?: string; roleCode: string },
  ) {
    if (!data?.roleCode) return;

    const user = (client as any).user || this.extractAndVerifyUser(client);
    const isProduction = process.env.NODE_ENV === 'production';

    if (user) {
      const userRole = (user.roleCode || user.role || '').toUpperCase();
      const targetRole = data.roleCode.toUpperCase();
      const isSuper = userRole === 'SUPER_ADMIN' || userRole === 'MEDINEXA_ADMIN';
      if (isSuper || userRole === targetRole) {
        if (data.facilityId && (isSuper || user.facilityId === data.facilityId)) {
          client.join(`role_${data.facilityId}_${data.roleCode}`);
        }
        client.join(`role_${data.roleCode}`);
      }
    } else if (!isProduction) {
      if (data.facilityId) {
        client.join(`role_${data.facilityId}_${data.roleCode}`);
      }
      client.join(`role_${data.roleCode}`);
    }
  }

  emitBedStatusChanged(event: BedStatusChangedEvent) {
    if (this.server) {
      this.server.emit('bed.status.changed', event);
      if (event.facilityId) {
        this.server.to(`facility_${event.facilityId}`).emit('bed.status.changed', event);
      }
    }
  }

  emitBedOccupancyUpdated(facilityId: string, stats: any) {
    if (this.server) {
      const payload = { facilityId, stats, timestamp: new Date().toISOString() };
      this.server.emit('bed.occupancy.updated', payload);
      this.server.to(`facility_${facilityId}`).emit('bed.occupancy.updated', payload);
    }
  }

  emitBedTransferCompleted(transferData: any) {
    if (this.server) {
      const payload = { ...transferData, timestamp: new Date().toISOString() };
      this.server.emit('bed.transfer.completed', payload);
      if (transferData.facilityId) {
        this.server.to(`facility_${transferData.facilityId}`).emit('bed.transfer.completed', payload);
      }
      if (transferData.patientUserId) {
        this.server.to(`user_${transferData.patientUserId}`).emit('bed.transfer.completed', payload);
      }
    }
  }

  emitBedBookingCreated(bookingData: any) {
    if (this.server) {
      const payload = { ...bookingData, timestamp: new Date().toISOString() };
      this.server.emit('bed.booking.created', payload);
      if (bookingData.facilityId) {
        this.server.to(`facility_${bookingData.facilityId}`).emit('bed.booking.created', payload);
      }
    }
  }

  emitAdmissionCreated(admissionData: any) {
    if (this.server) {
      const payload = { ...admissionData, timestamp: new Date().toISOString() };
      this.server.emit('admission.created', payload);
      if (admissionData.facilityId) {
        this.server.to(`facility_${admissionData.facilityId}`).emit('admission.created', payload);
      }
      if (admissionData.patientUserId) {
        this.server.to(`user_${admissionData.patientUserId}`).emit('admission.created', payload);
      }
    }
  }

  emitAdmissionDischarged(dischargeData: any) {
    if (this.server) {
      const payload = { ...dischargeData, timestamp: new Date().toISOString() };
      this.server.emit('admission.discharged', payload);
      if (dischargeData.facilityId) {
        this.server.to(`facility_${dischargeData.facilityId}`).emit('admission.discharged', payload);
      }
      if (dischargeData.patientUserId) {
        this.server.to(`user_${dischargeData.patientUserId}`).emit('admission.discharged', payload);
      }
    }
  }

  emitNotificationCreated(notification: any) {
    if (this.server) {
      const payload = { ...notification, timestamp: notification.createdAt || new Date().toISOString() };
      this.server.emit('notification.created', payload);
      if (notification.userId) {
        this.server.to(`user_${notification.userId}`).emit('notification.created', payload);
      }
    }
  }

  emitAppointmentStatusChanged(appointmentData: any) {
    if (this.server) {
      const payload = { ...appointmentData, timestamp: new Date().toISOString() };
      this.server.emit('appointment.status.changed', payload);
      if (appointmentData.facilityId) {
        this.server.to(`facility_${appointmentData.facilityId}`).emit('appointment.status.changed', payload);
      }
      if (appointmentData.patientUserId) {
        this.server.to(`user_${appointmentData.patientUserId}`).emit('appointment.status.changed', payload);
      }
    }
  }

  emitQueueStatusChanged(queueData: any) {
    if (this.server) {
      const payload = { ...queueData, timestamp: new Date().toISOString() };
      this.server.emit('queue.status.changed', payload);
      if (queueData.facilityId) {
        this.server.to(`facility_${queueData.facilityId}`).emit('queue.status.changed', payload);
      }
    }
  }

  emitPatientRegisteredAtFacility(registrationData: any) {
    if (this.server) {
      const payload = {
        patientId: registrationData.patientId,
        uhid: registrationData.uhid,
        hospitalRegistrationId: registrationData.hospitalRegistrationId || registrationData.id,
        mrn: registrationData.mrn,
        displayName: registrationData.displayName || registrationData.name || 'Patient',
        registrationStatus: registrationData.registrationStatus || registrationData.status || 'REGISTERED',
        facilityId: registrationData.facilityId,
        timestamp: registrationData.timestamp || new Date().toISOString(),
      };
      // Broadcast only to facility-scoped room to prevent cross-hospital eavesdropping
      if (registrationData.facilityId) {
        this.server.to(`facility_${registrationData.facilityId}`).emit('patient.registered.facility', payload);
        this.server.to(`facility_${registrationData.facilityId}`).emit('PATIENT_REGISTERED_AT_FACILITY', payload);
      }
    }
  }

  emitMedicineCommunicationChanged(commData: any) {
    if (this.server) {
      const payload = {
        patientId: commData.patientId,
        enabled: commData.enabled,
        status: commData.enabled ? 'ON' : 'OFF',
        notificationStatus: commData.enabled ? 'ACTIVE' : 'DISABLED',
        scoreStatus: commData.enabled ? 'ACTIVE' : 'PROTECTED',
        reason: commData.reason,
        reasonNote: commData.reasonNote,
        facilityId: commData.facilityId,
        updatedBy: commData.updatedBy,
        updatedByRole: commData.updatedByRole,
        timestamp: commData.timestamp || new Date().toISOString(),
      };
      this.server.emit('medicine.communication.changed', payload);
      this.server.emit('MEDICINE_COMMUNICATION_CHANGED', payload);
      if (commData.facilityId) {
        this.server.to(`facility_${commData.facilityId}`).emit('medicine.communication.changed', payload);
        this.server.to(`facility_${commData.facilityId}`).emit('MEDICINE_COMMUNICATION_CHANGED', payload);
      }
    }
  }

  emitPatientProfileUpdated(data: any) {
    if (this.server) {
      const payload = {
        patientId: data.patientId,
        uhid: data.uhid,
        phone: data.phone,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        bloodGroup: data.bloodGroup,
        emergencyContacts: data.emergencyContacts,
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
      // Broadcast only to facility-scoped room and patient's user room to protect PHI/PII
      if (data.facilityId) {
        this.server.to(`facility_${data.facilityId}`).emit('patient.profile.updated', payload);
        this.server.to(`facility_${data.facilityId}`).emit('PATIENT_PROFILE_UPDATED', payload);
      }
      const targetUserId = data.userId || data.patientUserId || data.patientId;
      if (targetUserId) {
        this.server.to(`user_${targetUserId}`).emit('patient.profile.updated', payload);
        this.server.to(`user_${targetUserId}`).emit('PATIENT_PROFILE_UPDATED', payload);
      }
    }
  }
}



