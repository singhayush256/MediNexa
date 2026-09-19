import { Injectable, Logger } from '@nestjs/common';
import { Subject, Subscription } from 'rxjs';
import { EventEmitter } from 'events';

export interface ClinicalDomainEvent<T = any> {
  type: string;
  payload: T;
  timestamp: string;
}

@Injectable()
export class ClinicalEventBusService {
  private readonly logger = new Logger(ClinicalEventBusService.name);
  private readonly emitter = new EventEmitter();
  private readonly rxBus$ = new Subject<ClinicalDomainEvent>();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  /**
   * Generic emit to both Node.js EventEmitter and RxJS observable stream
   */
  emit<T = any>(eventType: string, payload: T): void {
    const event: ClinicalDomainEvent<T> = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.logger.debug(`[ClinicalEventBus] Emitting event: ${eventType} for patient ${(payload as any)?.patientId || 'N/A'}`);

    // Push to RxJS stream
    this.rxBus$.next(event);

    // Asynchronously dispatch to registered listeners so callers are not blocked
    setImmediate(() => {
      try {
        this.emitter.emit(eventType, payload);
      } catch (err: any) {
        this.logger.error(`[ClinicalEventBus] Error dispatching event ${eventType}: ${err?.message}`, err?.stack);
      }
    });
  }

  /**
   * Register an asynchronous event listener
   */
  on<T = any>(eventType: string, handler: (payload: T) => Promise<void> | void): void {
    this.emitter.on(eventType, async (payload: T) => {
      try {
        await handler(payload);
      } catch (err: any) {
        this.logger.error(`[ClinicalEventBus] Listener error on event "${eventType}": ${err?.message}`, err?.stack);
      }
    });
  }

  /**
   * Subscribe via RxJS
   */
  subscribe(observer: (event: ClinicalDomainEvent) => void): Subscription {
    return this.rxBus$.subscribe(observer);
  }

  // =========================================================================
  // TYPED DOMAIN EVENT DISPATCHERS
  // =========================================================================

  emitVitalsRecorded(data: { patientId: string; vitals: any; recordedBy?: string; encounterId?: string }) {
    this.emit('vitals.recorded', data);
  }

  emitLabResultReady(data: { patientId: string; labOrderId?: string; testName: string; resultValue: any; abnormalFlag?: boolean }) {
    this.emit('lab.result.ready', data);
  }

  emitDiagnosisUpdated(data: { patientId: string; encounterId?: string; diagnosisName: string; status: string }) {
    this.emit('diagnosis.updated', data);
  }

  emitMedicationAdherenceChanged(data: { patientId: string; takenDoses: number; missedDoses: number; complianceScore: number }) {
    this.emit('medication.adherence.changed', data);
  }

  emitHealthScoreCritical(data: { patientId: string; overallScore: number; vitals: any; triggerReason?: string }) {
    this.emit('health_score.critical', data);
  }

  emitEmergencyTriggered(data: { patientId: string; emergencyNumber: string; severity: string; pickupAddress?: string }) {
    this.emit('emergency.triggered', data);
  }
}
