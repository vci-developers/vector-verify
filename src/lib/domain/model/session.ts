import { UUID } from "crypto";
import { SessionType } from "../reference/session-type";

export type Session = {
  sessionId: number;
  frontendId: UUID;
  houseNumber: string;
  collectorTitle: string;
  collectorName: string;
  collectionDate: number;
  collectionMethod: string;
  specimenCondition: string;
  createdAt: number;
  completedAt?: number;
  submittedAt?: number;
  notes: string;
  siteId: number;
  deviceId: number;
  latitude?: number;
  longitude?: number;
  type: SessionType;
};
