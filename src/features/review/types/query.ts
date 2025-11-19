export interface MonthlySummaryQuery {
  offset?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  district?: string;
  type?: string;
}

export interface SpecimensQuery {
  offset?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  district?: string;
  siteId?: number;
  species?: string | null;
  sex?: string | null;
  abdomenStatus?: string | null;
  includeAllImages?: boolean;
}

export interface SpecimenCountsQuery {
  district?: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
}

export interface SessionsQuery {
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
