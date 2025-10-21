import type { SiteDto } from '@/lib/entities/site/dto';

export interface MonthlySummary {
  district: string;
  year: number;
  month: number;
  monthString: string;
  monthName: string;
  sessionCount: number;
}

export interface MonthlySummaryFilters {
  offset?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  district?: string;
}

export interface DistrictOption {
  value: string;
  label: string;
}

export interface SpecimensListFilters {
  offset?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  district?: string;
  siteId?: number;
}

export interface SpecimenCountsFilters {
  district?: string;
  startDate?: string;
  endDate?: string;
}

export interface SpecimenCountEntry {
  species: string | null;
  sex: string | null;
  abdomenStatus: string | null;
  count: number;
  columnName: string;
}

export interface SpecimenCountsSite {
  siteId: number;
  siteInfo: SiteDto | null;
  counts: SpecimenCountEntry[];
  totalSpecimens: number;
}

export interface SpecimenCountsResponse {
  message: string;
  columns: string[];
  data: SpecimenCountsSite[];
}

export interface ColumnGroup {
  species: string;
  columns: {
    originalName: string;
    displayName: string;
  }[];
}

export interface GroupedColumns {
  groups: ColumnGroup[];
  totalColumns: number;
}
