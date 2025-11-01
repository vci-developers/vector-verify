import type { SiteDto } from '@/shared/entities/site/dto';
import type { Site } from '@/shared/entities/site/model';
import type { groupColumnsBySpecies } from '../utils/master-table-view';

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
  collectorName: string | null;
  collectorTitle: string | null;
  collectionMethod: string | null;
  mostRecentDate: number | null;
  sessionCount: number;
  hasCollectorNameDiscrepancy: boolean;
  hasCollectorTitleDiscrepancy: boolean;
  hasCollectionMethodDiscrepancy: boolean;
  collectorNames: string[];
  collectorTitles: string[];
  collectionMethods: string[];
  // Surveillance form fields
  numPeopleSleptInHouse: (number | null)[];
  wasIrsConducted: (boolean | null)[];
  monthsSinceIrs: (number | null)[];
  numLlinsAvailable: (number | null)[];
  llinType: (string | null)[];
  llinBrand: (string | null)[];
  numPeopleSleptUnderLlin: (number | null)[];
  // Discrepancy flags
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

export type DiscrepancyFieldKey =
  | 'collectorName'
  | 'collectorTitle'
  | 'collectionMethod'
  | 'numPeopleSleptInHouse'
  | 'wasIrsConducted'
  | 'monthsSinceIrs'
  | 'numLlinsAvailable'
  | 'llinType'
  | 'llinBrand'
  | 'numPeopleSleptUnderLlin';

export interface DiscrepancyField {
  key: DiscrepancyFieldKey;
  label: string;
  details: string;
}

export interface SiteDiscrepancySummary {
  siteId: number;
  sessionCount: number;
  siteLabel: SiteLabel;
  fields: DiscrepancyField[];
}

export interface MissingSiteSummary {
  site: Site;
  display: string;
}

export interface DataQualitySummary {
  siteDiscrepancies: SiteDiscrepancySummary[];
  missingSites: MissingSiteSummary[];
  isLoading: boolean;
}

export interface MosquitoTableMeta {
  columns: string[];
  groupedColumns: ReturnType<typeof groupColumnsBySpecies>;
  rows: {
    key: string;
    label: SiteLabel;
    countsByColumn: Record<string, number>;
    totalSpecimens?: number | null;
  }[];
  totals: Record<string, number>;
  grandTotal?: number | null;
  minWidth: number;
}
