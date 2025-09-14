import type {
  SpecimenDto,
  SpecimenWithImagesDto,
  SpecimenWithSessionDto,
  SpecimenExpandedDto,
} from '@/lib/entities/specimen/dto';
import type { Specimen } from '@/lib/entities/specimen/model';
import { mapSpecimenImageDtoToModel } from '@/lib/entities/specimen-image/mapper';
import { mapSessionDtoToModel } from '@/lib/entities/session/mapper';

export function mapSpecimenDtoToModel(dto: SpecimenDto): Specimen {
  return {
    id: dto.id,
    specimenId: dto.specimenId,
    sessionId: dto.sessionId,
    thumbnailUrl: dto.thumbnailUrl,
    thumbnailImageId: dto.thumbnailImageId,
  };
}

export function mapSpecimenWithImagesDtoToModel(dto: SpecimenWithImagesDto): Specimen {
  const base = mapSpecimenDtoToModel(dto);
  return {
    ...base,
    images: dto.images.map(mapSpecimenImageDtoToModel),
    thumbnailImage: dto.thumbnailImage ? mapSpecimenImageDtoToModel(dto.thumbnailImage) : null,
  };
}

export function mapSpecimenWithSessionDtoToModel(dto: SpecimenWithSessionDto): Specimen {
  const base = mapSpecimenDtoToModel(dto);
  return {
    ...base,
    session: mapSessionDtoToModel(dto.session),
  };
}

export function mapSpecimenExpandedDtoToModel(dto: SpecimenExpandedDto): Specimen {
  const withImages = mapSpecimenWithImagesDtoToModel(dto);
  return {
    ...withImages,
    session: mapSessionDtoToModel(dto.session),
  };
}

