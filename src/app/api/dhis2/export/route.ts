import { postDhis2Export } from '@/api/dhis2/post-dhis2-export';
import {
    postDhis2ExportQueryParamsSchema,
    type PostDhis2ExportResponseBody,
} from '@/api/dhis2/validation/post-dhis2-export-schema';
import { postDhis2UgandaExportBodySchema } from '@/api/dhis2/validation/post-dhis2-uganda-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const parsedQueryParams = postDhis2ExportQueryParamsSchema.safeParse(
        Object.fromEntries(searchParams),
    );
    if (!parsedQueryParams.success) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message: 'Invalid query params',
            }),
            { status: 400 },
        );
    }

    let rawBody: unknown;
    try {
        rawBody = await request.json();
    } catch {
        return NextResponse.json(
            err({ kind: 'client', status: 400, message: 'Invalid JSON body' }),
            { status: 400 },
        );
    }

    const parsedBody = postDhis2UgandaExportBodySchema.safeParse(rawBody);
    if (!parsedBody.success) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message: 'Invalid request body',
            }),
            { status: 400 },
        );
    }

    const authorizedPostDhis2ExportResult =
        await withAuthSession<PostDhis2ExportResponseBody>(accessToken =>
            postDhis2Export(
                accessToken,
                parsedQueryParams.data,
                parsedBody.data,
            ),
        );

    return NextResponse.json(authorizedPostDhis2ExportResult, {
        status: authorizedPostDhis2ExportResult.ok
            ? 200
            : (authorizedPostDhis2ExportResult.error.status ?? 400),
    });
}
