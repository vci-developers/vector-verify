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
}

export interface DashboardMetricsRequest {
  district: string;
  startDate: string;
  endDate: string;
}

export interface DashboardMetricsResponse {
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
}

// Additional data we'll need to fetch for complete dashboard
export interface SpecimenData {
  species: string | null;
  sex: string | null;
  abdomenStatus: string | null;
}

export interface SpeciesDistribution {
  species: string;
  count: number;
}

export interface SexRatio {
  total: number;
  male: { count: number; percentage: number };
  female: { count: number; percentage: number };
}

export interface AbdomenStatus {
  total: number;
  fed: { count: number; percentage: number };
  unfed: { count: number; percentage: number };
  gravid: { count: number; percentage: number };
}

export interface CompleteDashboardData extends DashboardMetrics {
  speciesDistribution: SpeciesDistribution[];
  sexRatio: SexRatio;
  abdomenStatus: AbdomenStatus;
}
