import { putAnnotationById } from '@/api/annotation/put-annotation-by-id';
import type {
    PutAnnotationByIdRequestBody,
    PutAnnotationByIdResponseBody,
} from '@/api/annotation/validation/put-annotation-by-id-schema';
import { ACCESS_COOKIE_NAME } from '@/features/auth_new/lib/cookies';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface RouteParams {
    params: Promise<{
        annotationId: string;
    }>;
}

export async function PUT(
    request: Request,
    { params }: RouteParams,
) {
    const accessToken = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;
    if (!accessToken) {
        const sessionExpiredErrorResult = err({
            kind: 'unauthorized',
            status: 401,
            message: 'Please sign in again',
        });
        return NextResponse.json(sessionExpiredErrorResult, { status: 401 });
    }

    let requestBody: PutAnnotationByIdRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        const requestBodyErrorResult = err({
            kind: 'client',
            status: 400,
            message: 'Invalid JSON body',
        });
        return NextResponse.json(requestBodyErrorResult, { status: 400 });
    }

    const annotationId = Number((await params).annotationId);

    const putAnnotationByIdResult: Result<
        PutAnnotationByIdResponseBody,
        NetworkError
    > = await putAnnotationById(accessToken, annotationId, requestBody);

    if (!putAnnotationByIdResult.ok) {
        return NextResponse.json(err(putAnnotationByIdResult.error), {
            status: putAnnotationByIdResult.error.status ?? 400,
        });
    }

    return NextResponse.json(ok(putAnnotationByIdResult.data), { status: 200 });
}
