import type {
  SpecimenCountsSummary,
  SpeciesDistribution,
  SexDistribution,
  AbdomenStatusDistribution,
} from '@/features/review/types/model';

function calculatePercentage(value: number, total: number): number {
  return total ? Math.round((value / total) * 100) : 0;
}

function normalizeAbdomenStatus(abdomenStatus: string | null): string {
  if (!abdomenStatus) return '';
  return abdomenStatus.toLowerCase().trim();
}

function isAnophelesGenus(species: string | null): boolean {
  if (!species) return false;
  return species.toLowerCase().startsWith('anopheles');
}

function isFedStatus(abdomenStatus: string): boolean {
  return abdomenStatus === 'fully fed' || abdomenStatus === 'full fed';
}

export function calculateSpeciesDistribution(
  specimenCounts: SpecimenCountsSummary,
): SpeciesDistribution[] {
  const speciesTotals = new Map<string, number>();

  specimenCounts.data.forEach(site => {
    site.counts.forEach(entry => {
      const species = (entry.species ?? '').trim();
      if (species) {
        speciesTotals.set(
          species,
          (speciesTotals.get(species) ?? 0) + entry.count,
        );
      }
    });
  });

  return Array.from(speciesTotals.entries())
    .map(([speciesName, speciesCount]) => ({
      species: speciesName,
      count: speciesCount,
    }))
    .sort((first, second) => second.count - first.count);
}

export function calculateAnophelesSexDistribution(
  specimenCounts: SpecimenCountsSummary,
): SexDistribution {
  let male = 0;
  let female = 0;

  specimenCounts.data.forEach(site => {
    site.counts.forEach(entry => {
      if (!isAnophelesGenus(entry.species)) return;

      const sex = (entry.sex ?? '').toLowerCase();

      if (sex === 'male') {
        male += entry.count;
      } else if (sex === 'female') {
        female += entry.count;
      }
    });
  });

  const total = male + female;

  return {
    total,
    male: {
      count: male,
      percentage: calculatePercentage(male, total),
    },
    female: {
      count: female,
      percentage: calculatePercentage(female, total),
    },
  };
}

export function calculateAnophelesAbdomenStatusDistribution(
  specimenCounts: SpecimenCountsSummary,
): AbdomenStatusDistribution {
  let fed = 0;
  let unfed = 0;
  let gravid = 0;
  let female = 0;

  specimenCounts.data.forEach(site => {
    site.counts.forEach(entry => {
      if (!isAnophelesGenus(entry.species)) return;

      const sex = (entry.sex ?? '').toLowerCase();

      if (sex === 'female') {
        female += entry.count;
        const abdomen = normalizeAbdomenStatus(entry.abdomenStatus);

        if (isFedStatus(abdomen)) {
          fed += entry.count;
        } else if (abdomen === 'unfed') {
          unfed += entry.count;
        } else if (abdomen === 'gravid') {
          gravid += entry.count;
        }
      }
    });
  });

  return {
    total: female,
    fed: {
      count: fed,
      percentage: calculatePercentage(fed, female),
    },
    unfed: {
      count: unfed,
      percentage: calculatePercentage(unfed, female),
    },
    gravid: {
      count: gravid,
      percentage: calculatePercentage(gravid, female),
    },
  };
}

export function formatMonthName(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}
