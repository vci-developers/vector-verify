import type { SiteDto } from '@/shared/entities/site/dto';
import type { SessionDto } from '@/shared/entities/session/dto';

export interface ReviewItemDto {
  district: string;
  year: number;
  month: number;
  sessionCount: number;
}

export interface MonthlySummaryResponseDto {
  reviews: ReviewItemDto[];
  districts: string[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SpecimenCountEntryDto {
  species: string | null;
  sex: string | null;
  abdomenStatus: string | null;
  count: number;
  columnName: string;
}

export interface SpecimenCountsSiteDto {
  siteId: number;
  siteInfo: SiteDto | null;
  counts: SpecimenCountEntryDto[];
  totalSpecimens: number;
}

export interface SpecimenCountsResponseDto {
  message: string;
  columns: string[];
  data: SpecimenCountsSiteDto[];
  sessionId?: string;
}

export interface SessionsResponseDto {
  sessions: SessionDto[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SessionsResponseDto {
  sessions: SessionDto[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface DashboardMetricsResponseDto {
  siteInformation: {
    housesUsedForCollection: number;
    peopleInAllHousesInspected: number;
  };
  entomologicalSummary: {
    vectorDensity: number;
    fedMosquitoesToPeopleSleptRatio: number;
    totalLlins: number;
    totalPeopleSleptUnderLlin: number;
    llinsPerPerson: number;
  };
  // Optional additional metrics provided by API for charts
  speciesDistribution?: Array<{ species: string; count: number }>;
  sexRatio?: {
    total: number;
    male: { count: number; percentage: number };
    female: { count: number; percentage: number };
  };
  abdomenStatus?: {
    total: number;
    fed: { count: number; percentage: number };
    unfed: { count: number; percentage: number };
    gravid: { count: number; percentage: number };
  };
}
