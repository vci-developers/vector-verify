import { putSurveillanceForm } from '@/api/surveillance-form/put-surveillance-form';
import type {
    PutSurveillanceFormRequestBody,
    PutSurveillanceFormResponseBody,
} from '@/api/surveillance-form/validation/put-surveillance-form-schema';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

interface RouteParams {
    params: Promise<{
        formId: string;
    }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
    const formId = Number((await params).formId);

    let requestBody: PutSurveillanceFormRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        return NextResponse.json(
            err({ kind: 'client', status: 400, message: 'Invalid JSON body' }),
            { status: 400 },
        );
    }

    const result = await withAuthSession<PutSurveillanceFormResponseBody>(
        accessToken => putSurveillanceForm(accessToken, formId, requestBody),
    );

    return NextResponse.json(result, {
        status: result.ok ? 200 : (result.error.status ?? 400),
    });
}
