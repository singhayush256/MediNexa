import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { BedStatusChangedEvent } from '@medinexa/types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/events',
})
export class BedGateway {
  @WebSocketServer()
  server!: Server;

  emitBedStatusChanged(event: BedStatusChangedEvent) {
    if (this.server) {
      // Emit to facility-specific room and global bed events channel
      this.server.emit('bed.status.changed', event);
      this.server.to(`facility_${event.facilityId}`).emit('bed.status.changed', event);
    }
  }

  emitBedOccupancyUpdated(facilityId: string, stats: any) {
    if (this.server) {
      this.server.emit('bed.occupancy.updated', { facilityId, stats, timestamp: new Date().toISOString() });
      this.server.to(`facility_${facilityId}`).emit('bed.occupancy.updated', { facilityId, stats, timestamp: new Date().toISOString() });
    }
  }

  emitBedTransferCompleted(transferData: any) {
    if (this.server) {
      this.server.emit('bed.transfer.completed', { ...transferData, timestamp: new Date().toISOString() });
      if (transferData.facilityId) {
        this.server.to(`facility_${transferData.facilityId}`).emit('bed.transfer.completed', { ...transferData, timestamp: new Date().toISOString() });
      }
    }
  }
}
