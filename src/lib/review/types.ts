import type { OffsetPage } from '@/lib/entities/pagination';

// Review module types - Backend DTO
export interface ReviewItemDto {
  district: string;
  year: number;
  month: number;
  sessionCount: number;
}

// Request DTO for monthly summary
export interface MonthlySummaryRequestDto {
  limit: number;
  offset: number;
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
  district?: string; // Single district selection
}

// Response DTO for monthly summary
export interface MonthlySummaryResponseDto {
  reviews: ReviewItemDto[];
  districts: string[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Frontend model with computed fields
export interface MonthlySummary {
  district: string;
  year: number;
  month: number;
  monthString: string; // "2024-01" format
  monthName: string; // "January 2024"
  sessionCount: number;
}

export interface MonthlySummaryFilters {
  offset?: number;
  limit?: number;
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
  district?: string; // Single district selection
}

export interface SpecimensListFilters {
  offset?: number;
  limit?: number;
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
  district?: string; // Single district selection
  siteId?: number; // Specific site ID
}

export interface DistrictOption {
  value: string;
  label: string;
}

// Helper to format month name
function getMonthName(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Helper to format month string
function getMonthString(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

// Mapper function to convert DTO item to MonthlySummary
export function mapReviewItemToMonthlySummary(
  item: ReviewItemDto,
): MonthlySummary {
  return {
    district: item.district,
    year: item.year,
    month: item.month,
    monthString: getMonthString(item.month, item.year),
    monthName: getMonthName(item.month, item.year),
    sessionCount: item.sessionCount,
  };
}

// Mapper function to convert DTO to OffsetPage
export function mapMonthlySummaryResponseDtoToPage(
  data: MonthlySummaryResponseDto,
): OffsetPage<MonthlySummary> {
  return {
    items: data.reviews.map(mapReviewItemToMonthlySummary),
    total: data.total,
    limit: data.limit,
    offset: data.offset,
    hasMore: data.hasMore,
  };
}
