import { getSpecimensExport } from '@/api/specimen/get-specimens-export';
import { getSpecimensExportQueryParamsSchema } from '@/api/specimen/validation/get-specimens-export-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getSpecimensExportQueryParamsSchema.safeParse(queryParams);
    if (!parsedQueryParams.success) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message: 'Invalid query parameters',
            }),
            { status: 400 },
        );
    }

    const authorizedGetSpecimensExportResult =
        await withAuthSession<NextResponse>(accessToken =>
            getSpecimensExport(accessToken, parsedQueryParams.data),
        );

    if (!authorizedGetSpecimensExportResult.ok) {
        return NextResponse.json(authorizedGetSpecimensExportResult, {
            status: authorizedGetSpecimensExportResult.error.status ?? 400,
        });
    }

    return authorizedGetSpecimensExportResult.data;
}
