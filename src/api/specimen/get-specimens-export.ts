import { err, ok, type Result } from '@/lib/result/result';
import {
    getSpecimensExportQueryParamsSchema,
    type GetSpecimensExportQueryParams,
} from './validation/get-specimens-export-schema';
import { NextResponse } from 'next/server';
import {
    statusToNetworkErrorKind,
    type NetworkError,
} from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { constructUrl } from '@/lib/network/construct-url';

export async function getSpecimensExport(
    accessToken: string,
    queryParams: GetSpecimensExportQueryParams,
): Promise<Result<NextResponse, NetworkError>> {
    const queryString = constructQueryString<GetSpecimensExportQueryParams>(
        queryParams,
        getSpecimensExportQueryParamsSchema,
    );

    const response = await fetch(
        constructUrl(`/specimens/export/csv${queryString}`),
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
                    'attachment; filename="specimens_export_raw.csv"',
            },
        }),
    );
}
