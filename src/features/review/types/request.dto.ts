import { SurveillanceForm } from "@/shared/entities/surveillance-form";

export interface MonthlySummaryRequestDto {
  offset?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  district?: string;
  type?: string;
}

export interface SpecimensRequestDto {
  offset?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  district?: string;
  siteId?: number;
  species?: string;
  sex?: string;
  abdomenStatus?: string;
  includeAllImages?: boolean;
  sessionType?: 'SURVEILLANCE' | 'DATA_COLLECTION';
}

export interface SpecimenCountsRequestDto {
  district?: string;
  startDate?: string;
  endDate?: string;
  sessionId?: string;
  sessionType?: 'SURVEILLANCE' | 'DATA_COLLECTION';
}

export interface SessionsRequestDto {
  district?: string;
  siteId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?:
    | 'id'
    | 'frontendId'
    | 'createdAt'
    | 'completedAt'
    | 'submittedAt'
    | 'collectionDate';
  sortOrder?: 'asc' | 'desc';
  type?: string;
}

export interface DashboardMetricsRequestDto {
  district: string;
  startDate?: string;
  endDate?: string;
  type?: string;
}

export interface ResolvedData{
  collectorTitle?: string | null;
  collectorName?: string | null;
  collectionDate?: number | null;
  collectionMethod?: string | null;
  specimenCondition?: string | null;
  createdAt?: number | null;
  completedAt?: number | null;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  type:"SURVEILLANCE";
  collectorLastTrainedOn?: number | null;
}

export interface DiscrepancyUpdateRequestDto {
  sessionIds?: number[];
  resolvedData?: ResolvedData;
  resolvedSurveillanceForm?: SurveillanceForm;
}
