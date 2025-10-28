import bff from '@/shared/infra/api/bff-client';
import { mapSessionDtoToModel } from '@/shared/entities/session/mapper';
import type { Session } from '@/shared/entities/session/model';
import type { SessionsQuery } from '@/features/review/types/query';
import type { SessionsResponseDto } from '@/features/review/types/response.dto';

const PAGE_LIMIT = 100;

async function fetchSessionsPage(
  params: SessionsQuery,
): Promise<SessionsResponseDto> {
  const {
    district,
    siteId,
    startDate,
    endDate,
    limit = PAGE_LIMIT,
    offset = 0,
    sortBy,
    sortOrder,
    type,
  } = params;

  const query: Record<string, string | number> = {
    limit: Math.min(limit, PAGE_LIMIT),
    offset,
  };

  if (district) query.district = district;
  if (siteId !== undefined) query.siteId = siteId;
  if (startDate) query.startDate = startDate;
  if (endDate) query.endDate = endDate;
  if (sortBy) query.sortBy = sortBy;
  if (sortOrder) query.sortOrder = sortOrder;
  if (type) query.type = type;

  return bff<SessionsResponseDto>('/sessions', {
    method: 'GET',
    query,
  });
}

export async function getAllSessions(
  params: SessionsQuery,
): Promise<Session[]> {
  let offset = params.offset ?? 0;
  const limit = Math.min(params.limit ?? PAGE_LIMIT, PAGE_LIMIT);
  const collected: Session[] = [];
  let hasMore = true;

  while (hasMore) {
    const page = await fetchSessionsPage({ ...params, offset, limit });
    const mapped = page.sessions.map(mapSessionDtoToModel);
    collected.push(...mapped);

    hasMore = page.hasMore && mapped.length > 0;
    if (!hasMore) break;
    offset += limit;
  }

  return collected;
}
