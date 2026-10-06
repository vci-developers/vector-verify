import type { Result } from '@/lib/result/result';
import type { GetFormByVersionSuccessPayload } from '../validation/get-form-by-version-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useQueries } from '@tanstack/react-query';
import { formKeys } from '../form-keys';

type GetFormByVersionQueryResult = Result<
    GetFormByVersionSuccessPayload,
    NetworkError
>;

async function fetchFormByVersion(
    programId: number,
    version: string,
): Promise<GetFormByVersionQueryResult> {
    const response = await fetch(
        `/api/programs/${programId}/forms/${encodeURIComponent(version)}`,
        {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        },
    );

    const getFormByVersionResult: GetFormByVersionQueryResult =
        await response.json();
    return getFormByVersionResult;
}

export function useGetFormsByVersions(programId: number, versions: string[]) {
    return useQueries({
        queries: versions.map(version => ({
            queryKey: formKeys.formByVersion(programId, version),
            queryFn: () => fetchFormByVersion(programId, version),
        })),
    });
}
