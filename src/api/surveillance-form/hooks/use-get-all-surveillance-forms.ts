import type {
    GetAllSurveillanceFormsQueryParams,
    GetAllSurveillanceFormsSuccessPayload,
} from '@/api/surveillance-form/validation/get-all-surveillance-forms-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { surveillanceFormKeys } from '@/api/surveillance-form/surveillance-form-keys';
import type { Result } from '@/lib/result/result';

type GetAllSurveillanceFormsQueryResult = Result<
    GetAllSurveillanceFormsSuccessPayload,
    NetworkError
>;

type GetAllSurveillanceFormsQueryOptions = Omit<
    UseQueryOptions<GetAllSurveillanceFormsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchAllSurveillanceForms(
    queryParams: GetAllSurveillanceFormsQueryParams,
): Promise<GetAllSurveillanceFormsQueryResult> {
    const response = await fetch('/api/surveillance-forms/all', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryParams),
    });

    const getAllSurveillanceFormsResult: GetAllSurveillanceFormsQueryResult =
        await response.json();
    return getAllSurveillanceFormsResult;
}

export function useGetAllSurveillanceForms(
    queryParams: GetAllSurveillanceFormsQueryParams,
    options?: GetAllSurveillanceFormsQueryOptions,
) {
    return useQuery({
        queryKey: surveillanceFormKeys.allSurveillanceForms(
            queryParams.sessionIds,
        ),
        queryFn: () => fetchAllSurveillanceForms(queryParams),
        ...options,
    });
}
