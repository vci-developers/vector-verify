import type { SpecimenImageDto } from '@/lib/entities/specimen-image/dto';
import type {
  SessionDto,
  SessionWithSiteDto,
} from '@/lib/entities/session/dto';

export interface SpecimenDto {
  id: number;
  specimenId: string;
  sessionId: number;
  thumbnailUrl: string | null;
  thumbnailImageId: number | null;
}

export interface SpecimenWithImagesDto extends SpecimenDto {
  images: SpecimenImageDto[];
  thumbnailImage: SpecimenImageDto | null;
}

export interface SpecimenWithSessionDto extends SpecimenDto {
  session: SessionDto;
}

export interface SpecimenExpandedDto extends SpecimenDto {
  images: SpecimenImageDto[];
  thumbnailImage: SpecimenImageDto | null;
  session: SessionWithSiteDto;
}
