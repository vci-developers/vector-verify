import { SessionType } from "@/lib/domain/reference/session-type";
import { UUID } from "crypto";

export type SessionDto = {
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
  latitude?: number;
  longitude?: number;
  type: SessionType;
};
