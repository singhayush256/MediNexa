import { Injectable } from '@nestjs/common';
import { AiProvider, AiResponse } from './ai-provider.interface';

@Injectable()
export class MockAiProvider implements AiProvider {
  async generateResponse(prompt: string, context?: any): Promise<AiResponse> {
    const p = prompt.toLowerCase();

    const disclaimer = '\n\n*Note: MediNexa AI Assistant provides information and navigation support only. Autonomous medical diagnosis, prescribing, or clinical decisions are not performed.*';

    if (p.includes('appointment')) {
      return {
        answer: `MediNexa Appointment Assistant: You can manage, book, and check availability for doctor appointments via the /dashboard/appointments interface. Confirmed appointments can be checked-in and started directly by assigned clinicians.${disclaimer}`,
        sources: ['MediNexa Appointment Subsystem'],
      };
    }

    if (p.includes('bed') || p.includes('capacity') || p.includes('icu')) {
      return {
        answer: `MediNexa Bed & Capacity Assistant: Real-time bed management tracks live AVAILABLE, RESERVED, and OCCUPIED bed states. Inter-hospital network bed searches can be performed under /dashboard/network-hospitals.${disclaimer}`,
        sources: ['MediNexa Live Bed Management Engine'],
      };
    }

    if (p.includes('referral') || p.includes('transfer')) {
      return {
        answer: `MediNexa Referral Assistant: Cross-facility transfers require destination hospital acceptance and bed reservation holds. Record transfer authorizations must be authorized by patients or clinical personnel.${disclaimer}`,
        sources: ['MediNexa Hospital Referral Subsystem'],
      };
    }

    if (p.includes('lab') || p.includes('prescription') || p.includes('medication')) {
      return {
        answer: `MediNexa Clinical Assistant: Clinical encounters integrate with master Laboratory Test Catalogs and Pharmacy Fulfillment. Verified lab results and issued prescriptions appear in authorized patient EHR timelines.${disclaimer}`,
        sources: ['MediNexa EHR & Clinical Encounter Foundation'],
      };
    }

    return {
      answer: `Hello! I am your MediNexa Healthcare Network Assistant. I can assist you with navigating your dashboard, summarizing authorized appointments, looking up hospital bed availability, or retrieving system information.${disclaimer}`,
      sources: ['MediNexa Knowledge Base'],
    };
  }
}
