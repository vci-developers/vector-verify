import type { Specimen } from '@/shared/entities/specimen';
import {
  mapSpecimenExpandedDtoToModel,
  type SpecimenExpandedDto,
} from '@/shared/entities/specimen';
import bff from '@/shared/infra/api/bff-client';

export async function getSpecimen(specimenId: number): Promise<Specimen> {
  const dto = await bff<SpecimenExpandedDto>(`/specimens/${specimenId}`);
  return mapSpecimenExpandedDtoToModel(dto);
}


