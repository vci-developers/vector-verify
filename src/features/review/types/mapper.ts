import type { OffsetPage } from '@/shared/entities/pagination';
import type {
  ReviewItemDto,
  MonthlySummaryResponseDto,
  SpecimenCountsResponseDto,
  SpecimenCountsSiteDto,
  DashboardMetricsResponseDto,
} from './response.dto';
import type {
  MonthlySummary,
  SpecimenCountEntry,
  SpecimenCountsSummary,
  SpecimenCountsSite,
  DashboardMetrics,
} from './model';

function getMonthName(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getMonthString(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function mapReviewItemDtoToMonthlySummary(
  dto: ReviewItemDto,
): MonthlySummary {
  return {
    district: dto.district,
    year: dto.year,
    month: dto.month,
    monthString: getMonthString(dto.month, dto.year),
    monthName: getMonthName(dto.month, dto.year),
    sessionCount: dto.sessionCount,
  };
}

export function mapMonthlySummaryResponseDtoToPage(
  dto: MonthlySummaryResponseDto,
): OffsetPage<MonthlySummary> {
  return {
    items: dto.reviews.map(mapReviewItemDtoToMonthlySummary),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
    hasMore: dto.hasMore,
  };
}

function mapSpecimenEntryDtoToModel(dto: SpecimenCountsSiteDto['counts'][number]): SpecimenCountEntry {
  return {
    species: dto.species,
    sex: dto.sex,
    abdomenStatus: dto.abdomenStatus,
    count: dto.count,
    columnName: dto.columnName,
  };
}

function mapSpecimenCountsSiteDtoToModel(dto: SpecimenCountsSiteDto): SpecimenCountsSite {
  return {
    siteId: dto.siteId,
    siteInfo: dto.siteInfo,
    counts: dto.counts.map(mapSpecimenEntryDtoToModel),
    totalSpecimens: dto.totalSpecimens,
  };
}

export function mapSpecimenCountsResponseDtoToModel(
  dto: SpecimenCountsResponseDto,
): SpecimenCountsSummary {
  return {
    columns: dto.columns,
    data: dto.data.map(mapSpecimenCountsSiteDtoToModel),
  };
}

export function mapDashboardMetricsResponseDtoToModel(
  dto: DashboardMetricsResponseDto,
): DashboardMetrics {
  return {
    siteInformation: dto.siteInformation,
    entomologicalSummary: dto.entomologicalSummary,
    speciesDistribution: dto.speciesDistribution,
    sexDistribution: dto.sexRatio,
    abdomenStatusDistribution: dto.abdomenStatus,
  };
}
