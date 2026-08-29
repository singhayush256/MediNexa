export interface IPacsProvider {
  storeStudy(studyData: any): Promise<{
    studyUid: string;
    seriesUid: string;
    storageLocation: string;
    thumbnailUrl: string;
  }>;
  getStudy(studyUid: string): Promise<any>;
  generateThumbnail(modality: string): string;
  deleteStudy(studyUid: string): Promise<boolean>;
}
