import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockAiProvider } from './providers/mock-ai.provider';
import { RoleCode } from '@medinexa/types';

@Injectable()
export class AiService {
  private readonly provider: MockAiProvider;

  constructor(private readonly prisma: PrismaService) {
    this.provider = new MockAiProvider();
  }

  async processChat(message: string, contextType: string | undefined, contextId: string | undefined, requestingUser: any) {
    if (!message || message.trim().length === 0) {
      throw new BadRequestException('Message cannot be empty');
    }

    if (message.length > 2000) {
      throw new BadRequestException('Message exceeds maximum allowed prompt length of 2000 characters');
    }

    // Context Security Validation
    if (contextType === 'Patient' && contextId) {
      if (requestingUser.role === RoleCode.PATIENT && requestingUser.patientProfile?.id !== contextId) {
        throw new ForbiddenException('Patients cannot query AI assistant with another patient context');
      }
    }

    // Sanitize summary for audit logging (never store secrets/passwords)
    const requestSummary = message.slice(0, 100);

    await this.prisma.aiInteractionAudit.create({
      data: {
        userId: requestingUser.id,
        role: requestingUser.role,
        facilityId: requestingUser.facilityId,
        requestSummary,
        contextType: contextType || 'General',
        contextId: contextId || null,
      },
    });

    // Generate AI response
    const response = await this.provider.generateResponse(message, {
      role: requestingUser.role,
      facilityId: requestingUser.facilityId,
      contextType,
      contextId,
    });

    return response;
  }
}
