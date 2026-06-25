import { postExportSign } from '@/api/export/post-export-sign';
import {
    postExportSignRequestBodySchema,
    type PostExportSignRequestBody,
    type PostExportSignResponseBody,
} from '@/api/export/validation/post-export-sign-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    let requestBody: PostExportSignRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        return NextResponse.json(
            err({ kind: 'client', status: 400, message: 'Invalid JSON body' }),
            { status: 400 },
        );
    }

    const parsedBody = postExportSignRequestBodySchema.safeParse(requestBody);
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

    const authorizedPostExportSignResult =
        await withAuthSession<PostExportSignResponseBody>(accessToken =>
            postExportSign(accessToken, parsedBody.data),
        );

    return NextResponse.json(authorizedPostExportSignResult, {
        status: authorizedPostExportSignResult.ok
            ? 200
            : (authorizedPostExportSignResult.error.status ?? 400),
    });
}
