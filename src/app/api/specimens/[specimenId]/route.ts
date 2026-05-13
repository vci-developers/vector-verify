import { getSpecimenById } from '@/api/specimen/get-specimen-by-id';
import type { GetSpecimenByIdResponseBody } from '@/api/specimen/validation/get-specimen-by-id-schema';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

interface RouteParams {
    params: Promise<{
        specimenId: string;
    }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
    const specimenId = Number((await params).specimenId);

    const authorizedGetSpecimenByIdResult =
        await withAuthSession<GetSpecimenByIdResponseBody>(accessToken =>
            getSpecimenById(accessToken, specimenId),
        );

    return NextResponse.json(authorizedGetSpecimenByIdResult, {
        status: authorizedGetSpecimenByIdResult.ok
            ? 200
            : (authorizedGetSpecimenByIdResult.error.status ?? 400),
    });
}
