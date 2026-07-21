import { postResourcesSign } from '@/api/resources/post-resources-sign';
import {
    postResourcesSignRequestBodySchema,
    type PostResourcesSignRequestBody,
    type PostResourcesSignResponseBody,
} from '@/api/resources/validation/post-resources-sign-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    let requestBody: PostResourcesSignRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        return NextResponse.json(
            err({ kind: 'client', status: 400, message: 'Invalid JSON body' }),
            { status: 400 },
        );
    }

    const parsedBody =
        postResourcesSignRequestBodySchema.safeParse(requestBody);
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

    const authorizedPostResourcesSignResult =
        await withAuthSession<PostResourcesSignResponseBody>(accessToken =>
            postResourcesSign(accessToken, parsedBody.data),
        );

    return NextResponse.json(authorizedPostResourcesSignResult, {
        status: authorizedPostResourcesSignResult.ok
            ? 200
            : (authorizedPostResourcesSignResult.error.status ?? 400),
    });
}
