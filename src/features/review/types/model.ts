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
  bottomLine?: string;
}

export interface HouseholdRowData {
  key: string;
  siteLabel: SiteLabel;
  sessionCount: number;
  collectorName: string;
  hasCollectorNameDiscrepancy: boolean;
  collectorTitle: string;
  hasCollectorTitleDiscrepancy: boolean;
  mostRecentDate: number | null;
  collectionMethod: string;
  hasCollectionMethodDiscrepancy: boolean;
  numPeopleSleptInHouse: (number | null)[];
  hasNumPeopleSleptInHouseDiscrepancy: boolean;
  wasIrsConducted: (boolean | null)[];
  hasWasIrsConductedDiscrepancy: boolean;
  monthsSinceIrs: (number | null)[];
  hasMonthsSinceIrsDiscrepancy: boolean;
  numLlinsAvailable: (number | null)[];
  hasNumLlinsAvailableDiscrepancy: boolean;
  llinType: (string | null)[];
  hasLlinTypeDiscrepancy: boolean;
  llinBrand: (string | null)[];
  hasLlinBrandDiscrepancy: boolean;
  numLlinsUsed: (number | null)[];
  hasNumLlinsUsedDiscrepancy: boolean;
  numPeopleSleptUnderLlin: (number | null)[];
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
