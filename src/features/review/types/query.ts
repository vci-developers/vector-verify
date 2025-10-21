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
}

export interface SpecimenCountsQuery {
  district?: string;
  startDate?: string;
  endDate?: string;
}
