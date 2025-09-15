import type { SiteDto } from '@/lib/entities/site/dto';
import type { Site } from '@/lib/entities/site/model';

export function mapSiteDtoToModel(dto: SiteDto): Site {
  return { ...dto };
}
