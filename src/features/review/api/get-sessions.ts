import bff from '@/shared/infra/api/bff-client';
import { SessionsRequestDto } from '../types';
import type { SessionsQuery, SessionsResponseDto } from '../types';
import { mapSessionsResponseDtoToModel } from '@/shared/entities/session';


export async function getSessions(
    filters: SessionsQuery,
): Promise<SessionsResponseDto> {
    const {
        district,
        startDate,
        endDate,
        limit,
    } = filters;

    const query: SessionsRequestDto = {
    ...(district ? { district } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    limit: limit ?? 100,
    };

    const data = await bff<SessionsResponseDto>('/sessions', {
        method: 'GET',
        query: query as Record<string, string | number | boolean | null | undefined>,
    });

    return mapSessionsResponseDtoToModel(data);
}