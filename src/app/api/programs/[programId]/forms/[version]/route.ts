import type { GetFormByVersionResponseBody } from '@/api/form/validation/get-form-by-version-schema';
import { getFormByVersion } from '@/api/form/get-form-by-version';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

interface RouteParams {
    params: Promise<{
        programId: string;
        version: string;
    }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
    const { programId, version } = await params;

    const authorizedGetFormByVersionResult =
        await withAuthSession<GetFormByVersionResponseBody>(accessToken =>
            getFormByVersion(accessToken, Number(programId), version),
        );

    return NextResponse.json(authorizedGetFormByVersionResult, {
        status: authorizedGetFormByVersionResult.ok
            ? 200
            : (authorizedGetFormByVersionResult.error.status ?? 400),
    });
}
