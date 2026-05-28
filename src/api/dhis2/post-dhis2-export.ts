import 'server-only';

import {
    postDhis2ExportQueryParamsSchema,
    postDhis2ExportResponseSchema,
    type PostDhis2ExportQueryParams,
    type PostDhis2ExportResponseBody,
} from '@/api/dhis2/validation/post-dhis2-export-schema';
import type { PostDhis2UgandaExportBody } from '@/api/dhis2/validation/post-dhis2-uganda-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function postDhis2Export(
    accessToken: string,
    queryParams: PostDhis2ExportQueryParams,
    requestBody: PostDhis2UgandaExportBody,
): Promise<Result<PostDhis2ExportResponseBody, NetworkError>> {
    const queryString = constructQueryString(
        queryParams,
        postDhis2ExportQueryParamsSchema,
    );

    return safeApiCall<PostDhis2ExportResponseBody>(
        `/dhis2/sync${queryString}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        },
        postDhis2ExportResponseSchema,
    );
}
