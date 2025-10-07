import { mapSpecimenExpandedDtoToPage } from "@/lib/entities/specimen";
import type { OffsetPage } from "@/lib/entities/pagination";
import type { Specimen } from "@/lib/entities/specimen/model";
import { DEFAULT_PAGE_SIZE } from "@/lib/shared/constants";
import bff from "@/lib/shared/http/client/bff-client";
import type { SpecimensListFilters } from "@/lib/review/types";
import type { SpecimensListResponseDto } from "@/lib/entities/specimen/dto";


export async function getSpecimens(
  filters: SpecimensListFilters = {}
): Promise<OffsetPage<Specimen>> {
  const {
    offset = 0,
    limit = DEFAULT_PAGE_SIZE,
    dateTo,
    dateFrom,
    district,
  } = filters;


  const query = {
    limit,
    offset,
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(district && { district }),
  };


  console.log('getSpecimens query:', query);


  const data = await bff<SpecimensListResponseDto>('/specimens', {
    method: 'GET',
    query,
  });


  return mapSpecimenExpandedDtoToPage(data);
}
