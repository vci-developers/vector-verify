import { getPrograms } from '@/api/program/get-programs';
import { getProgramsQueryParamsSchema } from '@/api/program/validation/get-programs-schema';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getProgramsQueryParamsSchema.safeParse(queryParams);
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

    const getProgramsResult = await getPrograms(parsedQueryParams.data);

    return NextResponse.json(getProgramsResult, {
        status: getProgramsResult.ok
            ? 200
            : (getProgramsResult.error.status ?? 400),
    });
}
