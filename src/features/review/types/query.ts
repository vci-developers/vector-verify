export interface MonthlySummaryQuery {
  offset?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  district?: string;
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
}

export interface SpecimenCountsQuery {
  district?: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
}

export interface SessionsQuery {
  district?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
