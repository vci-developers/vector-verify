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
