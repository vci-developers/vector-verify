'use client';

import bff from '@/shared/infra/api/bff-client';
import {
  DiscrepancyUpdateRequestDto,
  DiscrepancyUpdateResponseDto,
} from '@/features/review/types';
import { createJsonRequestInit } from '@/shared/infra/http/core/json';

export async function updateDiscrepancies(
  payload: DiscrepancyUpdateRequestDto,
): Promise<DiscrepancyUpdateResponseDto> {
  return await bff<DiscrepancyUpdateResponseDto>(
    `/sessions/conflicts/resolve`,
    {
      method: 'POST',
      ...createJsonRequestInit(payload),
    },
  );
}
