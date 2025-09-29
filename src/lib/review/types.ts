// Based on actual API documentation
export interface SessionDto {
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
}

export interface SiteDto {
  siteId: number;
  programId: number;
  district: string | null;
  subCounty: string | null;
  parish: string | null;
  villageName: string | null;
  houseNumber: string;
  isActive: boolean;
  healthCenter: string | null;
}

export interface SessionsResponseDto {
  sessions: SessionDto[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SitesResponseDto {
  sites: SiteDto[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Backend response types
export interface MonthlySummary {
  district: string;
  month: string; // "2024-01" format
  year: number;
  monthName: string; // "January 2024"
  totalSessions: number;
  totalSpecimens: number;
  status?: string; // "In Review", "Draft", "Needs Attention", "Approved", "Exported"
  discrepancies?: number;
  lastUpdated?: string; // ISO date string
}

export interface MonthlySummaryResponse {
  monthlySummaries: MonthlySummary[];
  availableDistricts: Array<{
    name: string;
    hasData: boolean;
  }>;
}

export interface MonthlySummaryFilters {
  dateFrom?: string; // YYYY-MM-DD format
  dateTo?: string; // YYYY-MM-DD format
  districts?: string[];
}

export interface DistrictOption {
  value: string;
  label: string;
}
