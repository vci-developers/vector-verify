import type { SiteDto } from '@/shared/entities/site/dto';
import type { Site } from '@/shared/entities/site/model';

export function mapSiteDtoToModel(dto: SiteDto): Site {
  return { ...dto };
}
