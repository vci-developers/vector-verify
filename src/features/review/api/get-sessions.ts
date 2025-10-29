import bff from '@/shared/infra/api/bff-client';
import { SessionsRequestDto } from '../types';
import type { SessionsQuery, SessionsResponseDto } from '../types';
import { mapSessionsResponseDtoToModel } from '@/shared/entities/session';
import { DEFAULT_PAGE_SIZE } from "@/shared/entities/pagination";



export async function getSessions(
    filters: SessionsQuery,
): Promise<SessionsResponseDto> {
    const {
        district,
        startDate,
        endDate,
        limit = DEFAULT_PAGE_SIZE,
        offset = 0,
    } = filters;

    const query: SessionsRequestDto = {
    ...(district ? { district } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(offset !== undefined ? { offset } : {}),
    ...(limit !== undefined ? { limit } : {}),    
    };

    const data = await bff<SessionsResponseDto>('/sessions', {
        method: 'GET',
        query: query as Record<string, string | number | boolean | null | undefined>,
    });

    return mapSessionsResponseDtoToModel(data);
}