export interface SiteDto {
  siteId: number;
  programId: number;
  district: string | null;
  subCounty: string | null;
  parish: string | null;
  villageName: string | null;
  houseNumber: string | null;
  healthCenter: string | null;
  isActive: boolean;
}
