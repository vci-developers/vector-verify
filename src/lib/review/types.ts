import type { OffsetPage } from '@/lib/entities/pagination';

// Review module types
export interface MonthlySummary {
  district: string;
  month: string; // "2024-01" format
  year: number;
  monthName: string; // "January 2024"
  totalSessions: number;
  totalSpecimens: number;
  status?: string; // "In Review", "Draft", "Needs Attention", "Approved", "Exported"
  discrepancies?: number;
  lastUpdated?: string; // ISO date string
}

export interface MonthlySummaryResponseDto {
  monthlySummaries: MonthlySummary[];
  availableDistricts: Array<{
    name: string;
    hasData: boolean;
  }>;
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface MonthlySummaryFilters {
  page?: number;
  limit?: number;
  dateFrom?: string; // YYYY-MM-DD format
  dateTo?: string; // YYYY-MM-DD format
  district?: string; // Single district selection
}

export interface DistrictOption {
  value: string;
  label: string;
}

// Mapper function to convert DTO to OffsetPage (following annotation pattern)
export function mapMonthlySummaryResponseDtoToPage(
  data: MonthlySummaryResponseDto,
): OffsetPage<MonthlySummary> {
  return {
    items: data.monthlySummaries,
    total: data.total,
    limit: data.limit,
    offset: data.offset,
    hasMore: data.hasMore,
  };
}
