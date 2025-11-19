import {
  useQuery,
  useInfiniteQuery,
  type UseQueryOptions,
  type UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { getSessions } from '../api/get-sessions';
import { reviewKeys, type SessionsQueryKey } from '../api/review-keys';
import type { SessionsQuery } from '../types';
import type { OffsetPage } from '@/shared/entities/pagination/model';
import type { Session } from '@/shared/entities/session/model';
import { DEFAULT_PAGE_SIZE } from '@/shared/entities/pagination';

export function useSessionsQuery(
  filters: SessionsQuery = {},
  options?: Omit<
    UseQueryOptions<
      OffsetPage<Session>,
      Error,
      OffsetPage<Session>,
      SessionsQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  const {
    district,
    startDate,
    endDate,
    limit,
    offset,
    sortBy,
    sortOrder,
    type = 'SURVEILLANCE',
  } = filters;

  const enabled = Boolean(district && startDate && endDate);

  return useQuery({
    queryKey: reviewKeys.sessions(
      district,
      startDate,
      endDate,
      limit,
      offset,
      sortBy,
      sortOrder,
      type,
    ) as SessionsQueryKey,
    queryFn: async () => getSessions(filters),
    enabled: enabled && (options?.enabled ?? true),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useSessionsInfiniteQuery(
  filters: SessionsQuery = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      OffsetPage<Session>,
      Error,
      OffsetPage<Session>,
      OffsetPage<Session>,
      SessionsQueryKey,
      number
    >,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >,
) {
  const {
    district,
    startDate,
    endDate,
    limit = DEFAULT_PAGE_SIZE,
    sortBy,
    sortOrder,
    type = 'SURVEILLANCE',
  } = filters;

  const enabled = Boolean(district && startDate && endDate);

  return useInfiniteQuery({
    queryKey: reviewKeys.sessions(
      district,
      startDate,
      endDate,
      limit,
      undefined,
      sortBy,
      sortOrder,
      type,
    ) as SessionsQueryKey,
    queryFn: async ({ pageParam = 0 }) =>
      getSessions({
        ...filters,
        limit,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (sum, page) => sum + (page.items?.length ?? 0),
        0,
      );
      return loaded < (lastPage.total ?? 0) ? loaded : undefined;
    },
    initialPageParam: 0,
    enabled: enabled && (options?.enabled ?? true),
    ...options,
  });
}
