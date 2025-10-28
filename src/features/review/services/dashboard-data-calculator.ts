import type { SpecimenCountsSummary } from '../types';
import type {
  DashboardMetrics,
  SpeciesDistribution,
  SexRatio,
  AbdomenStatus,
  CompleteDashboardData,
} from '../types/dashboard';

interface DashboardDataInput {
  metrics: DashboardMetrics;
  specimenCounts: SpecimenCountsSummary;
}

export class DashboardDataCalculator {
  static calculateSpeciesDistribution(
    specimenCounts: SpecimenCountsSummary,
  ): SpeciesDistribution[] {
    const speciesMap = new Map<string, number>();

    specimenCounts.data.forEach(site => {
      site.counts.forEach(count => {
        if (count.species) {
          const currentCount = speciesMap.get(count.species) || 0;
          speciesMap.set(count.species, currentCount + count.count);
        }
      });
    });

    return Array.from(speciesMap.entries())
      .map(([species, count]) => ({ species, count }))
      .sort((a, b) => b.count - a.count);
  }

  static calculateSexRatio(specimenCounts: SpecimenCountsSummary): SexRatio {
    let totalCount = 0;
    let maleCount = 0;
    let femaleCount = 0;

    specimenCounts.data.forEach(site => {
      site.counts.forEach(count => {
        if (
          count.species &&
          count.species.toLowerCase().includes('anopheles')
        ) {
          if (count.sex === 'Male') {
            maleCount += count.count;
            totalCount += count.count;
          } else if (count.sex === 'Female') {
            femaleCount += count.count;
            totalCount += count.count;
          }
        }
      });
    });

    return {
      total: totalCount,
      male: {
        count: maleCount,
        percentage:
          totalCount > 0
            ? Math.round((maleCount / totalCount) * 100 * 10) / 10
            : 0,
      },
      female: {
        count: femaleCount,
        percentage:
          totalCount > 0
            ? Math.round((femaleCount / totalCount) * 100 * 10) / 10
            : 0,
      },
    };
  }

  static calculateAbdomenStatus(
    specimenCounts: SpecimenCountsSummary,
  ): AbdomenStatus {
    let totalCount = 0;
    let fedCount = 0;
    let unfedCount = 0;
    let gravidCount = 0;

    specimenCounts.data.forEach(site => {
      site.counts.forEach(count => {
        if (
          count.species &&
          count.species.toLowerCase().includes('anopheles')
        ) {
          if (count.abdomenStatus === 'Fed') {
            fedCount += count.count;
            totalCount += count.count;
          } else if (count.abdomenStatus === 'Unfed') {
            unfedCount += count.count;
            totalCount += count.count;
          } else if (count.abdomenStatus === 'Gravid') {
            gravidCount += count.count;
            totalCount += count.count;
          }
        }
      });
    });

    return {
      total: totalCount,
      fed: {
        count: fedCount,
        percentage:
          totalCount > 0
            ? Math.round((fedCount / totalCount) * 100 * 10) / 10
            : 0,
      },
      unfed: {
        count: unfedCount,
        percentage:
          totalCount > 0
            ? Math.round((unfedCount / totalCount) * 100 * 10) / 10
            : 0,
      },
      gravid: {
        count: gravidCount,
        percentage:
          totalCount > 0
            ? Math.round((gravidCount / totalCount) * 100 * 10) / 10
            : 0,
      },
    };
  }

  static calculateHousesUsedForCollection(
    specimenCounts: SpecimenCountsSummary,
  ): number {
    return specimenCounts.data.length;
  }

  static calculateTotalSpecimens(
    specimenCounts: SpecimenCountsSummary,
  ): number {
    return specimenCounts.data.reduce(
      (total, site) => total + site.totalSpecimens,
      0,
    );
  }

  static calculateVectorDensity(specimenCounts: SpecimenCountsSummary): number {
    const totalSpecimens = this.calculateTotalSpecimens(specimenCounts);
    const totalHouses = this.calculateHousesUsedForCollection(specimenCounts);

    return totalHouses > 0
      ? Math.round((totalSpecimens / totalHouses) * 100) / 100
      : 0;
  }

  static calculateFedMosquitoesToPeopleSleptRatio(
    abdomenStatus: AbdomenStatus,
    peopleInAllHousesInspected: number,
  ): number {
    if (peopleInAllHousesInspected === 0) {
      return 0;
    }

    return (
      Math.round((abdomenStatus.fed.count / peopleInAllHousesInspected) * 100) /
      100
    );
  }

  static calculateBednetsPerPerson(
    totalBednets: number,
    peopleWhoSleptUnderBednets: number,
  ): number {
    if (peopleWhoSleptUnderBednets === 0) {
      return 0;
    }

    return Math.round((totalBednets / peopleWhoSleptUnderBednets) * 100) / 100;
  }

  static calculateDashboardData(
    input: DashboardDataInput,
  ): CompleteDashboardData {
    const { metrics, specimenCounts } = input;

    const speciesDistribution =
      this.calculateSpeciesDistribution(specimenCounts);
    const sexRatio = this.calculateSexRatio(specimenCounts);
    const abdomenStatus = this.calculateAbdomenStatus(specimenCounts);
    const housesUsedForCollection =
      this.calculateHousesUsedForCollection(specimenCounts);

    return {
      siteInformation: {
        housesUsedForCollection,
        peopleInAllHousesInspected:
          metrics.siteInformation.peopleInAllHousesInspected,
      },
      entomologicalSummary: {
        vectorDensity: metrics.entomologicalSummary.vectorDensity,
        fedMosquitoesToPeopleSleptRatio:
          metrics.entomologicalSummary.fedMosquitoesToPeopleSleptRatio,
        totalLlins: metrics.entomologicalSummary.totalLlins,
        totalPeopleSleptUnderLlin:
          metrics.entomologicalSummary.totalPeopleSleptUnderLlin,
        llinsPerPerson: metrics.entomologicalSummary.llinsPerPerson,
      },
      speciesDistribution,
      sexRatio,
      abdomenStatus,
    };
  }

  static validateData(input: DashboardDataInput): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!input.metrics) {
      errors.push('Metrics data is missing');
    }

    if (!input.specimenCounts) {
      errors.push('Specimen counts data is missing');
    }

    if (input.specimenCounts && !input.specimenCounts.data) {
      errors.push('Specimen counts data is empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
