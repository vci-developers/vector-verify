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
