import { postDhis2Export } from '@/api/dhis2/post-dhis2-export';
import {
    postDhis2ExportRequestSchema,
    type PostDhis2ExportRequestBody,
    type PostDhis2ExportResponseBody,
} from '@/api/dhis2/validation/post-dhis2-export-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    let requestBody: PostDhis2ExportRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        return NextResponse.json(
            err({ kind: 'client', status: 400, message: 'Invalid JSON body' }),
            { status: 400 },
        );
    }

    const parsedBody = postDhis2ExportRequestSchema.safeParse(requestBody);
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

    const { irsData, ...queryParams } = parsedBody.data;

    const authorizedPostDhis2ExportResult =
        await withAuthSession<PostDhis2ExportResponseBody>(accessToken =>
            postDhis2Export(accessToken, queryParams, irsData),
        );

    return NextResponse.json(authorizedPostDhis2ExportResult, {
        status: authorizedPostDhis2ExportResult.ok
            ? 200
            : (authorizedPostDhis2ExportResult.error.status ?? 400),
    });
}
