import {
    getSessionsReportQueryParamsSchema,
    type GetSessionsReportQueryParams,
} from '@/api/session/validation/get-sessions-report-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { constructUrl } from '@/lib/network/construct-url';
import {
    statusToNetworkErrorKind,
    type NetworkError,
} from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function getSessionsReport(
    accessToken: string,
    queryParams?: GetSessionsReportQueryParams,
): Promise<Result<NextResponse, NetworkError>> {
    const queryString = constructQueryString<GetSessionsReportQueryParams>(
        queryParams,
        getSessionsReportQueryParamsSchema,
    );

    const response = await fetch(
        constructUrl(`/sessions/report${queryString}`),
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
                    response.headers.get('content-type') ??
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition':
                    response.headers.get('content-disposition') ??
                    'attachment; filename="sessions_report.xlsx"',
            },
        }),
    );
}
