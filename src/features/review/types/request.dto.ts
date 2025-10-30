export interface MonthlySummaryRequestDto {
  offset?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  district?: string;
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
}

export interface SpecimenCountsRequestDto {
  district?: string;
  startDate?: string;
  endDate?: string;
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
