import type { SpecimenImageDto } from '@/shared/entities/specimen-image/dto';
import type { SpecimenImage } from '@/shared/entities/specimen-image/model';

export function mapSpecimenImageDtoToModel(
  dto: SpecimenImageDto,
): SpecimenImage {
  return { ...dto };
}
