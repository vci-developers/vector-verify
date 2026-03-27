import { getAllSurveillanceForms } from '@/api/surveillance-form/get-all-surveillance-forms';
import {
    getAllSurveillanceFormsQueryParamsSchema,
    type GetAllSurveillanceFormsResponseBody,
} from '@/api/surveillance-form/validation/get-all-surveillance-forms-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();

    const parsedBody = getAllSurveillanceFormsQueryParamsSchema.safeParse(body);
    if (!parsedBody.success) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message: 'Invalid request body: sessionIds array is required',
            }),
            { status: 400 },
        );
    }

    const authorizedGetAllSurveillanceFormsResult =
        await withAuthSession<GetAllSurveillanceFormsResponseBody>(
            accessToken =>
                getAllSurveillanceForms(accessToken, parsedBody.data),
        );

    return NextResponse.json(authorizedGetAllSurveillanceFormsResult, {
        status: authorizedGetAllSurveillanceFormsResult.ok
            ? 200
            : (authorizedGetAllSurveillanceFormsResult.error.status ?? 400),
    });
}
