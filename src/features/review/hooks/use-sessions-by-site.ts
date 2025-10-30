import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { Session } from '@/shared/entities/session/model';
import { getAllSessions } from '@/features/review/api/get-sessions';
import {
  reviewKeys,
  type SessionsBySiteQueryKey,
} from '@/features/review/api/review-keys';
import type { SessionsQuery } from '@/features/review/types/query';

export interface SessionsBySite {
  siteId: number;
  siteLabel?: string;
  sessions: Session[];
}

type UseSessionsBySiteOptions = Omit<
  UseQueryOptions<
    SessionsBySite[],
    Error,
    SessionsBySite[],
    SessionsBySiteQueryKey
  >,
  'queryKey' | 'queryFn'
>;

export function useSessionsBySiteQuery(
  params: SessionsQuery,
  options?: UseSessionsBySiteOptions,
) {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(params?.district && params?.startDate && params?.endDate);

  return useQuery({
    queryKey: reviewKeys.sessionsBySite(
      params?.district,
      params?.siteId,
      params?.startDate,
      params?.endDate,
      params?.limit,
      params?.offset,
      params?.sortBy,
      params?.sortOrder,
      params?.startDate,
      params?.endDate,
      params?.siteId,
      params?.type,
    ) as SessionsBySiteQueryKey,
    queryFn: async () => {
      const sessions = await getAllSessions(params);
      const grouped = new Map<number, Session[]>();

      for (const session of sessions) {
        const siteId = session.siteId;
        const list = grouped.get(siteId) ?? [];
        list.push(session);
        grouped.set(siteId, list);
      }

      return Array.from(grouped.entries()).map(([siteId, siteSessions]) => ({
        siteId,
        siteLabel: undefined,
        sessions: siteSessions,
      }));
    },
    enabled,
    ...(options ?? {}),
  });
}
