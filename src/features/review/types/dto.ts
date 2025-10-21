import type { SiteDto } from '@/lib/entities/site/dto';

export interface MonthlySummaryRequestDto {
  limit: number;
  offset: number;
  startDate?: string;
  endDate?: string;
  district?: string;
}

export interface ReviewItemDto {
  district: string;
  year: number;
  month: number;
  sessionCount: number;
}

export interface MonthlySummaryResponseDto {
  reviews: ReviewItemDto[];
  districts: string[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SpecimenCountEntryDto {
  species: string | null;
  sex: string | null;
  abdomenStatus: string | null;
  count: number;
  columnName: string;
}

export interface SpecimenCountsSiteDto {
  siteId: number;
  siteInfo: SiteDto | null;
  counts: SpecimenCountEntryDto[];
  totalSpecimens: number;
}

export interface SpecimenCountsResponseDto {
  message: string;
  columns: string[];
  data: SpecimenCountsSiteDto[];
}
