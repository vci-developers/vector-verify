import { getAllReviewLogs } from '@/api/session/get-all-review-logs';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { getReviewLogsQueryParamsSchema } from '@/api/session/validation/get-review-logs-schema';

export async function GET(request: Request) {
    const parsed = getReviewLogsQueryParamsSchema.safeParse(
        Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!parsed.success)
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message: 'Invalid query parameters',
            }),
            { status: 400 },
        );
    const result = await withAuthSession(accessToken =>
        getAllReviewLogs(accessToken, parsed.data),
    );
    return NextResponse.json(result, {
        status: result.ok ? 200 : (result.error.status ?? 400),
    });
}
