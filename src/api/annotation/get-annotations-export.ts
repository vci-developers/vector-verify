import { NextResponse } from 'next/server';
import {
    getAnnotationsExportQueryParamsSchema,
    type GetAnnotationsExportQueryParams,
} from './validation/get-annotations-export-schema';
import {
    statusToNetworkErrorKind,
    type NetworkError,
} from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { constructUrl } from '@/lib/network/construct-url';

export async function getAnnotationsExport(
    accessToken: string,
    queryParams: GetAnnotationsExportQueryParams,
): Promise<Result<NextResponse, NetworkError>> {
    const queryString = constructQueryString<GetAnnotationsExportQueryParams>(
        queryParams,
        getAnnotationsExportQueryParamsSchema,
    );

    const response = await fetch(
        constructUrl(`/annotations/export${queryString}`),
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    if (!response.ok) {
        return err({
            kind: statusToNetworkErrorKind(response.status),
            status: response.status,
        });
    }

    return ok(
        new NextResponse(response.body, {
            status: response.status,
            headers: {
                'Content-Type':
                    response.headers.get('content-type') ?? 'text/csv',
                'Content-Disposition':
                    response.headers.get('content-disposition') ??
                    'attachment; filename="annotations_export_raw.csv"',
            },
        }),
    );
}
