import type {
  SpecimenDto,
  SpecimenExpandedDto,
  SpecimensListResponseDto,
} from '@/shared/entities/specimen/dto';
import type { Specimen } from '@/shared/entities/specimen/model';
import { mapSpecimenImageDtoToModel } from '@/shared/entities/specimen-image/mapper';
import { mapSessionDtoToModel } from '@/shared/entities/session/mapper';
import { OffsetPage } from '../pagination';

export function mapSpecimenDtoToModel(dto: SpecimenDto): Specimen {
  return {
    id: dto.id,
    specimenId: dto.specimenId,
    sessionId: dto.sessionId,
    thumbnailUrl: dto.thumbnailUrl,
    thumbnailImageId: dto.thumbnailImageId,
  };
}

export function mapSpecimenExpandedDtoToModel(
  dto: SpecimenExpandedDto,
): Specimen {
  const base = mapSpecimenDtoToModel(dto);
  return {
    ...base,
    images: dto.images ? dto.images.map(mapSpecimenImageDtoToModel) : undefined,
    thumbnailImage:
      dto.thumbnailImage === null
        ? null
        : dto.thumbnailImage
          ? mapSpecimenImageDtoToModel(dto.thumbnailImage)
          : undefined,
    session: dto.session ? mapSessionDtoToModel(dto.session) : undefined,
  };
}

export function mapSpecimenExpandedDtoToPage(
  dto: SpecimensListResponseDto
): OffsetPage<Specimen> {
  return {
    items: dto.specimens.map(mapSpecimenExpandedDtoToModel),
    total: dto.total,
    offset: dto.offset,
    limit: dto.limit,
    hasMore: dto.hasMore,
  };
}
