import { putAnnotationById } from '@/api/annotation/put-annotation-by-id';
import type {
    PutAnnotationByIdRequestBody,
    PutAnnotationByIdResponseBody,
} from '@/api/annotation/validation/put-annotation-by-id-schema';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

interface RouteParams {
    params: Promise<{
        annotationId: string;
    }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
    const annotationId = Number((await params).annotationId);

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

    const authorizedPutAnnotationByIdResult =
        await withAuthSession<PutAnnotationByIdResponseBody>(accessToken =>
            putAnnotationById(accessToken, annotationId, requestBody),
        );

    return NextResponse.json(authorizedPutAnnotationByIdResult, {
        status: authorizedPutAnnotationByIdResult.ok
            ? 200
            : (authorizedPutAnnotationByIdResult.error.status ?? 400),
    });
}
