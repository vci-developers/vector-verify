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

export interface PermissionsSiteResponseDto {
  id: number; //same as siteId
  programId: number;
  district: string | null;
  subCounty: string | null;
  parish: string | null;
  villageName: string | null;
  houseNumber: string | null;
  healthCenter: string | null;
  isActive: boolean;
}
