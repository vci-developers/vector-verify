import { getGeocode } from '@/api/geocode/get-geocode';
import { geocodeQueryParamsSchema } from '@/api/geocode/validation/get-geocode-schema';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);

    const parsed = geocodeQueryParamsSchema.safeParse(
        Object.fromEntries(url.searchParams.entries()),
    );
    if (!parsed.success) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message: 'Invalid query parameters',
            }),
            { status: 400 },
        );
    }

    const result = await getGeocode(parsed.data);

    return NextResponse.json(result, {
        status: result.ok ? 200 : (result.error.status ?? 400),
    });
}
