import type { SpecimenImageDto } from '@/shared/entities/specimen-image/dto';
import type { SessionWithSiteDto } from '@/shared/entities/session/dto';

export interface SpecimenDto {
  id: number;
  specimenId: string;
  sessionId: number;
  thumbnailUrl: string | null;
  thumbnailImageId: number | null;
  shouldProcessFurther: boolean;
}

export interface SpecimenExpandedDto extends SpecimenDto {
  images: SpecimenImageDto[];
  thumbnailImage: SpecimenImageDto | null;
  session: SessionWithSiteDto;
}

export interface SpecimensListResponseDto {
 specimens: SpecimenExpandedDto[];
 total: number;
 limit: number;
 offset: number;
 hasMore: boolean;
}
