import { constructUrl } from '@/lib/network/construct-url';
import {
    statusToNetworkErrorKind,
    type NetworkError,
} from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function getSpecimenImage(
    accessToken: string,
    specimenId: number,
    imageId: number,
): Promise<Result<NextResponse, NetworkError>> {
    const url = constructUrl(`/specimens/${specimenId}/images/${imageId}`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        return err({
            kind: statusToNetworkErrorKind(response.status),
            status: response.status,
        });
    }

    return ok(
        new NextResponse(response.body, {
            status: response.status,
            headers: {
                'Content-Type':
                    response.headers.get('content-type') ??
                    'application/octet-stream',
                'Cache-Control':
                    response.headers.get('cache-control') ??
                    'private, max-age=60',
            },
        }),
    );
}
