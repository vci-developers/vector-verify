import type { QueryKey } from '@tanstack/react-query';

export const masterTableViewKeys = {
  root: ['review', 'master-table-view'] as const,
  specimenCounts: (
    district?: string | null,
    startDate?: string | null,
    endDate?: string | null,
  ) =>
    [
      ...masterTableViewKeys.root,
      'specimen-counts',
      {
        district: district ?? null,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
      },
    ] as const,

  surveillanceForm: (sessionId: number) =>
    [...masterTableViewKeys.root, 'surveillance-form', { sessionId }] as const,
} as const;

export type SpecimenCountsQueryKey = ReturnType<
  typeof masterTableViewKeys.specimenCounts
> &
  QueryKey;

export type SurveillanceFormQueryKey = ReturnType<
  typeof masterTableViewKeys.surveillanceForm
> &
  QueryKey;
