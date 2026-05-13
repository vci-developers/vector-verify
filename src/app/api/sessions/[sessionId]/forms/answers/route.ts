import { getFormAnswersBySessionId } from '@/api/form-answer/get-form-answers-by-session-id';
import {
    getFormAnswersBySessionIdQueryParamsSchema,
    type GetFormAnswersBySessionIdResponseBody,
} from '@/api/form-answer/validation/get-form-answers-by-session-id-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

interface GetFormAnswersBySessionIdRouteParams {
    params: Promise<{
        sessionId: string;
    }>;
}

export async function GET(
    request: Request,
    { params }: GetFormAnswersBySessionIdRouteParams,
) {
    const sessionId = Number((await params).sessionId);

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getFormAnswersBySessionIdQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetFormAnswersBySessionIdResult =
        await withAuthSession<GetFormAnswersBySessionIdResponseBody>(
            accessToken =>
                getFormAnswersBySessionId(
                    accessToken,
                    sessionId,
                    parsedQueryParams.data,
                ),
        );

    return NextResponse.json(authorizedGetFormAnswersBySessionIdResult, {
        status: authorizedGetFormAnswersBySessionIdResult.ok
            ? 200
            : (authorizedGetFormAnswersBySessionIdResult.error.status ?? 400),
    });
}
