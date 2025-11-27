/**
 * IRS (Indoor Residual Spraying) data for a single site
 */
export interface SiteIrsData {
  siteId: number;
  wasIrsSprayed: boolean;
  insecticideSprayed: string | null;
  dateLastSprayed: string | null; // ISO date string "YYYY-MM-DD"
}

/**
 * Village-level IRS form data
 * User fills this out once per village, applies to all sites in that village
 */
export interface VillageIrsFormData {
  villageName: string;
  wasIrsSprayed: boolean;
  insecticideSprayed: string;
  dateLastSprayed: string; // ISO date string "YYYY-MM-DD"
}

/**
 * Request body for POST /dhis2/sync
 */
export interface Dhis2SyncRequestBody {
  irsData: SiteIrsData[];
}
