import { getSpecimenById } from '@/api/specimen/get-specimen-by-id';
import type { GetSpecimenByIdResponseBody } from '@/api/specimen/validation/get-specimen-by-id-schema';
import { ACCESS_COOKIE_NAME } from '@/features/auth_new/lib/cookies';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface GetSpecimenByIdRouteParams {
    params: Promise<{
        specimenId: string;
    }>;
}

export async function GET(
    _request: Request,
    { params }: GetSpecimenByIdRouteParams,
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

    const specimenId = Number((await params).specimenId);

    const getSpecimenByIdResult: Result<
        GetSpecimenByIdResponseBody,
        NetworkError
    > = await getSpecimenById(accessToken, specimenId);

    if (!getSpecimenByIdResult.ok) {
        return NextResponse.json(err(getSpecimenByIdResult.error), {
            status: getSpecimenByIdResult.error.status ?? 400,
        });
    }

    return NextResponse.json(ok(getSpecimenByIdResult.data), { status: 200 });
}
