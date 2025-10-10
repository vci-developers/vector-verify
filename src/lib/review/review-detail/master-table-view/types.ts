export interface SpecimenCountsFilters {
  district?: string;
  startDate?: string;
  endDate?: string;
}

export interface SpecimenCountsResponse {
  message: string;
  columns: string[];
  data: SpecimenCountsSite[];
}

export interface SpecimenCountsSite {
  siteId: number;
  siteInfo: SpecimenCountsSiteInfo;
  counts: SpecimenCountEntry[];
}

export interface SpecimenCountsSiteInfo {
  district?: string | null;
  subCounty?: string | null;
  parish?: string | null;
  villageName?: string | null;
  houseNumber?: string | null;
  healthCenter?: string | null;
}

export interface SpecimenCountEntry {
  species: string | null;
  sex: string | null;
  abdomenStatus: string | null;
  count: number;
  columnName: string;
}
