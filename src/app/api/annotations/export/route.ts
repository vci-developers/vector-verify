import { getAnnotationsExport } from '@/api/annotation/get-annotations-export';
import { getAnnotationsExportQueryParamsSchema } from '@/api/annotation/validation/get-annotations-export-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getAnnotationsExportQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetAnnotationsExportResult =
        await withAuthSession<NextResponse>(accessToken =>
            getAnnotationsExport(accessToken, parsedQueryParams.data),
        );

    if (!authorizedGetAnnotationsExportResult.ok) {
        return NextResponse.json(authorizedGetAnnotationsExportResult, {
            status: authorizedGetAnnotationsExportResult.error.status ?? 400,
        });
    }

    return authorizedGetAnnotationsExportResult.data;
}
