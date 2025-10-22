import type {
  SessionDto,
  SessionWithSiteDto,
} from '@/shared/entities/session/dto';
import type { Session } from '@/shared/entities/session/model';
import { mapSiteDtoToModel } from '@/shared/entities/site/mapper';

export function mapSessionDtoToModel(
  dto: SessionDto | SessionWithSiteDto,
): Session {
  const base: Session = {
    sessionId: dto.sessionId,
    frontendId: dto.frontendId,
    collectorTitle: dto.collectorTitle,
    collectorName: dto.collectorName,
    collectionDate: dto.collectionDate,
    collectionMethod: dto.collectionMethod,
    specimenCondition: dto.specimenCondition,
    createdAt: dto.createdAt,
    completedAt: dto.completedAt,
    submittedAt: dto.submittedAt,
    notes: dto.notes,
    siteId: dto.siteId,
    deviceId: dto.deviceId,
    latitude: dto.latitude,
    longitude: dto.longitude,
    type: dto.type,
  };
  return 'site' in dto ? { ...base, site: mapSiteDtoToModel(dto.site) } : base;
}
