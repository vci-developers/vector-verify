import { getAllSurveillanceForms } from '@/api/surveillance-form/get-all-surveillance-forms';
import {
    getAllSurveillanceFormsQueryParamsSchema,
    type GetAllSurveillanceFormsResponseBody,
} from '@/api/surveillance-form/validation/get-all-surveillance-forms-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getAllSurveillanceFormsQueryParamsSchema.safeParse({
            ...queryParams,
            sessionId: queryParams.sessionId?.split(',') ?? [],
        });
    if (!parsedQueryParams.success) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message:
                    'Invalid query parameters: sessionId array is required',
            }),
            { status: 400 },
        );
    }

    const authorizedGetAllSurveillanceFormsResult =
        await withAuthSession<GetAllSurveillanceFormsResponseBody>(
            accessToken =>
                getAllSurveillanceForms(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetAllSurveillanceFormsResult, {
        status: authorizedGetAllSurveillanceFormsResult.ok
            ? 200
            : (authorizedGetAllSurveillanceFormsResult.error.status ?? 400),
    });
}
