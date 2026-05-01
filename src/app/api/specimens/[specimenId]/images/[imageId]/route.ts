import { getSpecimenImage } from '@/api/specimen-image/get-specimen-image';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

interface RouteParams {
    params: Promise<{
        specimenId: string;
        imageId: string;
    }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
    const routeParams = await params;
    const specimenId = Number(routeParams.specimenId);
    const imageId = Number(routeParams.imageId);

    const authorizedFetchImageResult = await withAuthSession(accessToken =>
        getSpecimenImage(accessToken, specimenId, imageId),
    );

    if (!authorizedFetchImageResult.ok) {
        return NextResponse.json(authorizedFetchImageResult, {
            status: authorizedFetchImageResult.error.status ?? 400,
        });
    }

    const upstream = authorizedFetchImageResult.data;
    return upstream;
}
