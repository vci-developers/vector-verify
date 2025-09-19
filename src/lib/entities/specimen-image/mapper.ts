import type { SpecimenImageDto } from '@/lib/entities/specimen-image/dto';
import type { SpecimenImage } from '@/lib/entities/specimen-image/model';

export function mapSpecimenImageDtoToModel(
  dto: SpecimenImageDto,
): SpecimenImage {
  return { ...dto };
}
