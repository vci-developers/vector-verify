import { getSurveillanceFormsExport } from '@/api/surveillance-form/get-surveillance-forms-export';
import { getSurveillanceFormsExportQueryParamsSchema } from '@/api/surveillance-form/validation/get-surveillance-forms-export-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getSurveillanceFormsExportQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetSurveillanceFormsExportResult =
        await withAuthSession<NextResponse>(accessToken =>
            getSurveillanceFormsExport(accessToken, parsedQueryParams.data),
        );

    if (!authorizedGetSurveillanceFormsExportResult.ok) {
        return NextResponse.json(authorizedGetSurveillanceFormsExportResult, {
            status:
                authorizedGetSurveillanceFormsExportResult.error.status ?? 400,
        });
    }

    return authorizedGetSurveillanceFormsExportResult.data;
}
