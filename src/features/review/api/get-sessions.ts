import bff from '@/shared/infra/api/bff-client';
import type { SessionsQuery, SessionsResponseDto } from '@/features/review/types';
import { SessionsRequestDto } from '@/features/review/types';
import { mapSessionsResponseDtoToModel } from '@/shared/entities/session';
import type { Session } from '@/shared/entities/session/model';
import { DEFAULT_PAGE_SIZE, OffsetPage } from '@/shared/entities/pagination';

const PAGE_LIMIT = 100;

async function requestSessions(
  params: SessionsQuery,
): Promise<SessionsResponseDto> {
  const {
    district,
    siteId,
    startDate,
    endDate,
    limit = DEFAULT_PAGE_SIZE,
    offset = 0,
    sortBy,
    sortOrder,
    type,
  } = params;

  const query = {
    limit: Math.min(limit, PAGE_LIMIT),
    offset,
    ...(district ? { district } : {}),
    ...(siteId !== undefined ? { siteId } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder } : {}),
    ...(type ? { type } : {}),
  };

  return bff<SessionsResponseDto>('/sessions', {
    method: 'GET',
    query
  });
}

export async function getSessions(
  filters: SessionsQuery,
): Promise<OffsetPage<Session>> {
  const data = await requestSessions(filters);
  return mapSessionsResponseDtoToModel(data);
}

export async function getAllSessions(
  params: SessionsQuery,
): Promise<Session[]> {
  let offset = params.offset ?? 0;
  const limit = Math.min(params.limit ?? PAGE_LIMIT, PAGE_LIMIT);
  const collected: Session[] = [];
  let hasMore = true;

  while (hasMore) {
    const page = await getSessions({ ...params, offset, limit });
    const items = page.items;
    collected.push(...items);

    hasMore = page.hasMore && items.length > 0;
    if (!hasMore) break;

    offset += limit;
  }

  return collected;
}
