export interface Site {
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


export interface canAccessSite{
  id: number;
  programId: number;
  district: string | null;
  subCounty: string | null;
  parish: string | null;
  villageName: string | null;
  houseNumber: string | null;
  healthCenter: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}