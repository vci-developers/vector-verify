import { geocodeKeys } from '@/api/geocode/geocode-keys';
import {
    geocodeQueryParamsSchema,
    type GeocodeQueryParams,
    type GetGeocodeSuccessPayload,
} from '@/api/geocode/validation/get-geocode-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type GetGeocodeQueryResult = Result<GetGeocodeSuccessPayload, NetworkError>;

type GetGeocodeQueryOptions = Omit<
    UseQueryOptions<GetGeocodeQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchGeocode(
    queryParams: GeocodeQueryParams,
): Promise<GetGeocodeQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        geocodeQueryParamsSchema,
    );

    const response = await fetch(`/api/geocode${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const result: GetGeocodeQueryResult = await response.json();
    return result;
}

export function useGetGeocode(
    queryParams: GeocodeQueryParams,
    options?: GetGeocodeQueryOptions,
) {
    return useQuery({
        queryKey: geocodeKeys.geocode(queryParams),
        queryFn: () => fetchGeocode(queryParams),
        ...options,
    });
}
