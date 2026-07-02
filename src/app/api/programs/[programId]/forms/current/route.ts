import type { GetCurrentFormByProgramIdResponseBody } from '@/api/form/validation/get-current-form-by-program-id-schema';
import { getCurrentFormByProgramId } from '@/api/form/get-current-form-by-program-id';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

interface RouteParams {
    params: Promise<{
        programId: string;
    }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
    const programId = Number((await params).programId);

    const authorizedGetCurrentFormByProgramIdResult =
        await withAuthSession<GetCurrentFormByProgramIdResponseBody>(
            accessToken => getCurrentFormByProgramId(accessToken, programId),
        );

    return NextResponse.json(authorizedGetCurrentFormByProgramIdResult, {
        status: authorizedGetCurrentFormByProgramIdResult.ok
            ? 200
            : (authorizedGetCurrentFormByProgramIdResult.error.status ?? 400),
    });
}
