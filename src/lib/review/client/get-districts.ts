import type { DistrictOption, SitesResponseDto } from '../types';
import bff from '@/lib/shared/http/client/bff-client';

export async function getDistricts(): Promise<DistrictOption[]> {
  console.log('Fetching districts from sites...');

  // Get all sites to extract unique districts
  const data = await bff<SitesResponseDto>('/sites/', {
    method: 'GET',
    query: {
      limit: 100, // Use maximum allowed limit
      offset: 0,
    },
  });

  console.log('Sites response:', data);

  // Extract unique districts from sites
  const districtSet = new Set<string>();
  data.sites.forEach(site => {
    if (site.district) {
      districtSet.add(site.district);
    }
  });

  // Convert to DistrictOption array and sort alphabetically
  return Array.from(districtSet)
    .map(district => ({
      value: district.toLowerCase().replace(/\s+/g, '-'),
      label: district,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
