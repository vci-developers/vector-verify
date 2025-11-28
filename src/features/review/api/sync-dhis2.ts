import bff from '@/shared/infra/api/bff-client';
import { createJsonRequestInit } from '@/shared/infra/http/core/json';
import type {
  SiteIrsData,
  Dhis2SyncRequestBody,
} from '@/features/review/types/dhis2-sync';

interface SyncDhis2Params {
  district: string;
  year: number;
  month: number;
  dryRun?: boolean;
  irsData: SiteIrsData[];
}

export async function syncDhis2({
  district,
  year,
  month,
  dryRun = false,
  irsData,
}: SyncDhis2Params) {
  const body: Dhis2SyncRequestBody = {
    irsData,
  };

  return bff<unknown>('/dhis2/sync', {
    method: 'POST',
    query: {
      district,
      year,
      month,
      dryRun,
    },
    timeoutMs: 10 * 60 * 1000, // 10 minutes
    ...createJsonRequestInit(body),
  });
}
