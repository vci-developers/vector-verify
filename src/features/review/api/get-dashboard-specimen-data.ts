import bff from '@/shared/infra/api/bff-client';
import type {
  SpecimenData,
  SpeciesDistribution,
  SexRatio,
  AbdomenStatus,
} from '@/features/review/types/dashboard';

interface SpecimenDataRequest {
  district: string;
  startDate: string;
  endDate: string;
}

interface SpecimenDataResponse {
  specimens: Array<{
    thumbnailImage: {
      species: string | null;
      sex: string | null;
      abdomenStatus: string | null;
    } | null;
  }>;
}

export async function getDashboardSpecimenData(
  request: SpecimenDataRequest,
): Promise<{
  speciesDistribution: SpeciesDistribution[];
  sexRatio: SexRatio;
  abdomenStatus: AbdomenStatus;
}> {
  const { district, startDate, endDate } = request;

  // Fetch all specimens using pagination since limit is max 100
  let allSpecimens: any[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;
  let maxPages = 50; // Safety limit to prevent infinite loops
  let pageCount = 0;

  while (hasMore && pageCount < maxPages) {
    try {
      const response = await bff<SpecimenDataResponse>('/specimens', {
        method: 'GET',
        query: {
          district,
          startDate,
          endDate,
          limit,
          offset,
        },
      });

      allSpecimens = [...allSpecimens, ...response.specimens];

      // Check if we have more data to fetch
      hasMore = response.specimens.length === limit;
      offset += limit;
      pageCount++;
    } catch (error) {
      console.error('Error fetching specimens:', error);
      // If there's an error, break out of the loop
      hasMore = false;
    }
  }

  // Process the data to create the required metrics
  const specimens = allSpecimens
    .map(s => s.thumbnailImage)
    .filter((img): img is NonNullable<typeof img> => img !== null);

  // Calculate species distribution
  const speciesCounts = new Map<string, number>();
  specimens.forEach(specimen => {
    if (specimen.species) {
      speciesCounts.set(
        specimen.species,
        (speciesCounts.get(specimen.species) || 0) + 1,
      );
    }
  });

  const speciesDistribution: SpeciesDistribution[] = Array.from(
    speciesCounts.entries(),
  )
    .map(([species, count]) => ({ species, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate sex ratio
  const totalSpecimens = specimens.length;
  const maleCount = specimens.filter(s => s.sex === 'male').length;
  const femaleCount = specimens.filter(s => s.sex === 'female').length;

  const sexRatio: SexRatio = {
    total: totalSpecimens,
    male: {
      count: maleCount,
      percentage:
        totalSpecimens > 0 ? Math.round((maleCount / totalSpecimens) * 100) : 0,
    },
    female: {
      count: femaleCount,
      percentage:
        totalSpecimens > 0
          ? Math.round((femaleCount / totalSpecimens) * 100)
          : 0,
    },
  };

  // Calculate abdomen status
  const fedCount = specimens.filter(s => s.abdomenStatus === 'fed').length;
  const unfedCount = specimens.filter(s => s.abdomenStatus === 'unfed').length;
  const gravidCount = specimens.filter(
    s => s.abdomenStatus === 'gravid',
  ).length;

  const abdomenStatus: AbdomenStatus = {
    total: totalSpecimens,
    fed: {
      count: fedCount,
      percentage:
        totalSpecimens > 0 ? Math.round((fedCount / totalSpecimens) * 100) : 0,
    },
    unfed: {
      count: unfedCount,
      percentage:
        totalSpecimens > 0
          ? Math.round((unfedCount / totalSpecimens) * 100)
          : 0,
    },
    gravid: {
      count: gravidCount,
      percentage:
        totalSpecimens > 0
          ? Math.round((gravidCount / totalSpecimens) * 100)
          : 0,
    },
  };

  return {
    speciesDistribution,
    sexRatio,
    abdomenStatus,
  };
}
