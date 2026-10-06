import { putSpecimenImageDataById } from '@/api/specimen-image/put-specimen-image-data-by-id';
import type {
    PutSpecimenImageDataByIdRequestBody,
    PutSpecimenImageDataByIdResponseBody,
} from '@/api/specimen-image/validation/put-specimen-image-data-by-id-schema';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

interface RouteParams {
    params: Promise<{
        specimenId: string;
        imageId: string;
    }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
    const { specimenId, imageId } = await params;

    let requestBody: PutSpecimenImageDataByIdRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        const requestBodyErrorResult = err({
            kind: 'client',
            status: 400,
            message: 'Invalid JSON body',
        });
        return NextResponse.json(requestBodyErrorResult, { status: 400 });
    }

    const authorizedPutSpecimenImageDataByIdResult =
        await withAuthSession<PutSpecimenImageDataByIdResponseBody>(
            accessToken =>
                putSpecimenImageDataById(
                    accessToken,
                    Number(specimenId),
                    Number(imageId),
                    requestBody,
                ),
        );

    return NextResponse.json(authorizedPutSpecimenImageDataByIdResult, {
        status: authorizedPutSpecimenImageDataByIdResult.ok
            ? 200
            : (authorizedPutSpecimenImageDataByIdResult.error.status ?? 400),
    });
}
