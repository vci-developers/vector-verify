import type { QueryKey } from '@tanstack/react-query';

export const reviewKeys = {
  root: ['review'] as const,
  monthlySummary: (
    offset?: number,
    limit?: number,
    startDate?: string,
    endDate?: string,
    district?: string,
    type?: string,
  ) =>
    [
      ...reviewKeys.root,
      'monthly-summary',
      { offset, limit, startDate, endDate, district, type },
    ] as const,

  specimens: (
    offset?: number,
    limit?: number,
    startDate?: string,
    endDate?: string,
    district?: string,
    siteId?: number,
    species?: string | null,
    sex?: string | null,
    abdomenStatus?: string | null,
    includeAllImages?: boolean,
    sessionType?: 'SURVEILLANCE' | 'DATA_COLLECTION',
  ) =>
    [
      ...reviewKeys.root,
      'specimens',
      {
        offset,
        limit,
        startDate,
        endDate,
        district,
        siteId,
        species,
        sex,
        abdomenStatus,
        includeAllImages,
        sessionType,
      },
    ] as const,

  sessions: (
    district?: string,
    startDate?: string,
    endDate?: string,
    limit?: number,
    offset?: number,
    sortBy?:
      | 'id'
      | 'frontendId'
      | 'createdAt'
      | 'completedAt'
      | 'submittedAt'
      | 'collectionDate',
    sortOrder?: 'asc' | 'desc',
    type?: string,
  ) =>
    [
      ...reviewKeys.root,
      'sessions',
      {
        district,
        startDate,
        endDate,
        limit,
        offset,
        sortBy,
        sortOrder,
        type,
      },
    ] as const,
  sessionsBySite: (
    district?: string,
    startDate?: string,
    endDate?: string,
    siteId?: number,
    type?: string,
  ) =>
    [
      ...reviewKeys.root,
      'sessions-by-site',
      { district, startDate, endDate, siteId, type },
    ] as const,
  specimenImages: (specimenId: number) =>
    [...reviewKeys.root, 'specimen-images', { specimenId }] as const,
} as const;

export type MonthlySummaryQueryKey = ReturnType<
  typeof reviewKeys.monthlySummary
> &
  QueryKey;

export type SpecimensQueryKey = ReturnType<typeof reviewKeys.specimens> &
  QueryKey;

export type SessionsQueryKey = ReturnType<typeof reviewKeys.sessions> &
  QueryKey;

export type SessionsBySiteQueryKey = ReturnType<
  typeof reviewKeys.sessionsBySite
> &
  QueryKey;

export type SpecimenImagesQueryKey = ReturnType<
  typeof reviewKeys.specimenImages
> &
  QueryKey;
