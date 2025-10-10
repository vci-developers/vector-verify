import type { SiteDto } from '@/lib/entities/site/dto';

export interface SpecimenCountsFilters {
  district?: string;
  startDate?: string;
  endDate?: string;
}

export interface SpecimenCountsResponse {
  message: string;
  columns: string[];
  data: SpecimenCountsSite[];
}

export interface SpecimenCountsSite {
  siteId: number;
  siteInfo: SiteDto | null;
  counts: SpecimenCountEntry[];
}

export interface SpecimenCountEntry {
  species: string | null;
  sex: string | null;
  abdomenStatus: string | null;
  count: number;
  columnName: string;
}
