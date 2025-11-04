import type { SiteDto } from '@/shared/entities/site/dto';

export interface MonthlySummary {
  district: string;
  year: number;
  month: number;
  monthString: string;
  monthName: string;
  sessionCount: number;
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

export interface SpecimenCountsSummary {
  columns: string[];
  data: SpecimenCountsSite[];
}

export interface SiteLabel {
  topLine: string;
  bottomLine: string | null;
}

export interface HouseholdRowData {
  key: string;
  siteLabel: SiteLabel;
  sessionCount: number;
  collectorName: string | null;
  collectorTitle: string | null;
  collectionMethod: string | null;
  mostRecentDate: number | null;
  hasCollectorNameDiscrepancy: boolean;
  hasCollectorTitleDiscrepancy: boolean;
  hasCollectionMethodDiscrepancy: boolean;
  collectorNames: string[];
  collectorTitles: string[];
  collectionMethods: string[];
  numPeopleSleptInHouse: (number | null)[];
  wasIrsConducted: (boolean | null)[];
  monthsSinceIrs: (number | null)[];
  numLlinsAvailable: (number | null)[];
  llinType: (string | null)[];
  llinBrand: (string | null)[];
  numPeopleSleptUnderLlin: (number | null)[];
  hasNumPeopleSleptInHouseDiscrepancy: boolean;
  hasWasIrsConductedDiscrepancy: boolean;
  hasMonthsSinceIrsDiscrepancy: boolean;
  hasNumLlinsAvailableDiscrepancy: boolean;
  hasLlinTypeDiscrepancy: boolean;
  hasLlinBrandDiscrepancy: boolean;
  hasNumPeopleSleptUnderLlinDiscrepancy: boolean;
}

export interface HouseholdTableMeta {
  rows: HouseholdRowData[];
  minWidth: number;
}

export interface MosquitoColumn {
  originalName: string;
  displayName: string;
}

export interface MosquitoGroupedColumns {
  speciesOrder: string[];
  columnsBySpecies: Record<string, MosquitoColumn[]>;
}

export interface MosquitoRowData {
  key: string;
  label: SiteLabel;
  countsByColumn: Record<string, number>;
  totalSpecimens: number;
}

export interface MosquitoTableMeta {
  rows: MosquitoRowData[];
  groupedColumns: MosquitoGroupedColumns;
  totals: Record<string, number>;
  grandTotal: number;
  minWidth: number;
}

export interface DashboardMetrics {
  siteInformation: {
    housesUsedForCollection: number;
    peopleInAllHousesInspected: number;
  };
  entomologicalSummary: {
    vectorDensity: number;
    fedMosquitoesToPeopleSleptRatio: number;
    totalLlins: number;
    totalPeopleSleptUnderLlin: number;
    llinsPerPerson: number;
  };
  speciesDistribution?: SpeciesDistribution[];
  sexDistribution?: SexDistribution;
  abdomenStatusDistribution?: AbdomenStatusDistribution;
}

export interface SpecimenData {
  species: string | null;
  sex: string | null;
  abdomenStatus: string | null;
}

export interface SpeciesDistribution {
  species: string;
  count: number;
}

export interface SexDistribution {
  total: number;
  male: { count: number; percentage: number };
  female: { count: number; percentage: number };
}

export interface AbdomenStatusDistribution {
  total: number;
  fed: { count: number; percentage: number };
  unfed: { count: number; percentage: number };
  gravid: { count: number; percentage: number };
}

export interface CompleteDashboardData extends DashboardMetrics {
  speciesDistribution: SpeciesDistribution[];
  sexDistribution: SexDistribution;
  abdomenStatusDistribution: AbdomenStatusDistribution;
}
