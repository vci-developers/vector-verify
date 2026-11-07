import { putSpecimenById } from '@/api/specimen/put-specimen-by-id';
import type {
    PutSpecimenByIdRequestBody,
    PutSpecimenByIdResponseBody,
} from '@/api/specimen/validation/put-specimen-by-id-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

interface RouteParams {
    params: Promise<{ specimenId: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
    const { specimenId } = await params;
    const numericSpecimenId = Number(specimenId);
    if (!Number.isSafeInteger(numericSpecimenId) || numericSpecimenId <= 0) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message: 'Invalid specimen ID',
            }),
            { status: 400 },
        );
    }

    let requestBody: PutSpecimenByIdRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        return NextResponse.json(
            err({ kind: 'client', status: 400, message: 'Invalid JSON body' }),
            { status: 400 },
        );
    }

    const result = await withAuthSession<PutSpecimenByIdResponseBody>(
        accessToken =>
            putSpecimenById(accessToken, numericSpecimenId, requestBody),
    );

    return NextResponse.json(result, {
        status: result.ok ? 200 : (result.error.status ?? 400),
    });
}
