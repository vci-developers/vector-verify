import { geocodeKeys } from '@/api/geocode/geocode-keys';
import {
    getGeocodeQueryParamsSchema,
    type GetGeocodeQueryParams,
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

export async function fetchGeocode(
    queryParams: GetGeocodeQueryParams,
): Promise<GetGeocodeQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getGeocodeQueryParamsSchema,
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
    queryParams: GetGeocodeQueryParams,
    options?: GetGeocodeQueryOptions,
) {
    return useQuery({
        queryKey: geocodeKeys.geocode(queryParams),
        queryFn: () => fetchGeocode(queryParams),
        ...options,
    });
}
