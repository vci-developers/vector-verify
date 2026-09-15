import {
    getUserAuthEventsReportQueryParamsSchema,
    type GetUserAuthEventsReportQueryParams,
} from '@/api/user/validation/get-user-auth-events-report-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { constructUrl } from '@/lib/network/construct-url';
import {
    statusToNetworkErrorKind,
    type NetworkError,
} from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function getUserAuthEventsReport(
    accessToken: string,
    queryParams: GetUserAuthEventsReportQueryParams,
): Promise<Result<NextResponse, NetworkError>> {
    const queryString =
        constructQueryString<GetUserAuthEventsReportQueryParams>(
            queryParams,
            getUserAuthEventsReportQueryParamsSchema,
        );

    const response = await fetch(
        constructUrl(`/users/auth-events/report${queryString}`),
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
                    'attachment; filename="user-auth-events-report.xlsx"',
            },
        }),
    );
}
