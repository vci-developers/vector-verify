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

export interface DashboardMetricsRequestDto {
  district: string;
  startDate: string;
  endDate: string;
}
