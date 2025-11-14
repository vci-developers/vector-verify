
export interface Session {
  sessionId: number;
  frontendId: string;
  collectorTitle: string | null;
  collectorName: string | null;
  collectionDate: number | null;
  collectionMethod: string | null;
  specimenCondition: string | null;
  createdAt: number | null;
  completedAt: number | null;
  submittedAt: number;
  notes: string | null;
  siteId: number;
  deviceId: number;
  latitude: number | null;
  longitude: number | null;
  type: string;
  collectorLastTrainedOn: number | null;
}
