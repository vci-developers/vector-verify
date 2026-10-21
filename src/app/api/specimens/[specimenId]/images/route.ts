import { specimenImagesIdSchema } from '@/api/specimen/validation/get-specimen-images-schema';
import { getSpecimenImages } from '@/api/specimen/get-specimen-images';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(
    _request: Request,
    context: { params: Promise<{ specimenId: string }> },
) {
    const parsedSpecimenId = specimenImagesIdSchema.safeParse(
        (await context.params).specimenId,
    );
    if (!parsedSpecimenId.success)
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message: 'Invalid specimen ID',
            }),
            { status: 400 },
        );
    const result = await withAuthSession(accessToken =>
        getSpecimenImages(accessToken, parsedSpecimenId.data),
    );
    return NextResponse.json(result, {
        status: result.ok ? 200 : (result.error.status ?? 400),
    });
}
