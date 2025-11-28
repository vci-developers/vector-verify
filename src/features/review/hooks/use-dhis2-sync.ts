'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { syncDhis2 } from '@/features/review/api';
import type { SiteIrsData } from '@/features/review/types/dhis2-sync';

interface SyncVariables {
  district: string;
  year: number;
  month: number;
  dryRun?: boolean;
  irsData: SiteIrsData[];
}

export function useDhis2SyncMutation(
  options?: Omit<
    UseMutationOptions<unknown, Error, SyncVariables>,
    'mutationFn'
  >,
) {
  return useMutation<unknown, Error, SyncVariables>({
    mutationFn: syncDhis2,
    ...options,
  });
}
