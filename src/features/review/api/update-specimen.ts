'use client';

import bff from '@/shared/infra/api/bff-client';
import {
    SpecimenUpdateRequestDto,
    SpecimenUpdateResponseDto
} from '@/features/review/types';
import { createJsonRequestInit } from '@/shared/infra/http/core/json';

export async function updateSpecimen(
    specimenId: number,
    thumbnailImageId: number,
    payload: SpecimenUpdateRequestDto,
): Promise<SpecimenUpdateResponseDto> {
    return await bff<SpecimenUpdateResponseDto>(
        `/specimens/${specimenId}/images/data/${thumbnailImageId}`,
        {
            method: 'PUT',
            ...createJsonRequestInit(payload),
        }
    );
}