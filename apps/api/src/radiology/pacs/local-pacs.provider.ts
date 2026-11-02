import { Injectable, Logger } from '@nestjs/common';
import { IPacsProvider } from './pacs-provider.interface';

@Injectable()
export class LocalPacsProvider implements IPacsProvider {
  private readonly logger = new Logger(LocalPacsProvider.name);

  async storeStudy(studyData: any) {
    const studyUid = studyData.studyUid || `1.2.840.113619.2.${Date.now()}.${Math.floor(1000 + Math.random() * 9000)}`;
    const seriesUid = studyData.seriesUid || `1.2.840.113619.2.${Date.now()}.1.${Math.floor(100 + Math.random() * 900)}`;
    const storageLocation = `/pacs/storage/${studyData.modality || 'XRAY'}/${studyUid}`;
    const thumbnailUrl = this.generateThumbnail(studyData.modality || 'XRAY');

    this.logger.log(`[LocalPACS] Archived DICOM study ${studyUid} at ${storageLocation}`);
    return {
      studyUid,
      seriesUid,
      storageLocation,
      thumbnailUrl,
    };
  }

  async getStudy(studyUid: string) {
    return {
      studyUid,
      status: 'ONLINE',
      storageProvider: 'LOCAL_PACS',
      retrievedAt: new Date().toISOString(),
    };
  }

  generateThumbnail(modality: string): string {
    const mod = modality.toUpperCase();
    return `/pacs/thumbnails/${mod.toLowerCase()}_sample.png`;
  }

  async deleteStudy(studyUid: string): Promise<boolean> {
    this.logger.log(`[LocalPACS] Deleted study ${studyUid}`);
    return true;
  }
}
