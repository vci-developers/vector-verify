import { programKeys } from '@/api/program/program-keys';
import {
    getProgramsQueryParamsSchema,
    type GetProgramsQueryParams,
    type GetProgramsResponseBody,
} from '@/api/program/validation/get-programs-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type GetProgramsQueryResult = Result<GetProgramsResponseBody, NetworkError>;

type GetProgramsQueryOptions = Omit<
    UseQueryOptions<GetProgramsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchPrograms(
    queryParams?: GetProgramsQueryParams,
): Promise<GetProgramsQueryResult> {
    const queryString = constructQueryString<GetProgramsQueryParams>(
        queryParams,
        getProgramsQueryParamsSchema,
    );

    const response = await fetch(`/api/programs${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    const getProgramsResult: GetProgramsQueryResult = await response.json();
    return getProgramsResult;
}

export function useGetPrograms(
    queryParams?: GetProgramsQueryParams,
    options?: GetProgramsQueryOptions,
) {
    return useQuery({
        queryKey: programKeys.programs(queryParams),
        queryFn: () => fetchPrograms(queryParams),
        ...options,
    });
}
