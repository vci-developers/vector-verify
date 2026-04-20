import 'server-only';

import { z } from 'zod';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { safeApiCall } from '@/lib/network/safe-api-call';
import {
    getGeocodeResponseSchema,
    type GetGeocodeQueryParams,
    type GetGeocodeResponseBody,
} from './validation/get-geocode-schema';

const nominatimResponseSchema = z.array(
    z.object({ lat: z.string(), lon: z.string() }),
);

let lastRequestTimestamp = 0;
const RATE_LIMIT_MS = 1100;

async function nominatimSearch(
    searchQuery: string,
): Promise<Result<GetGeocodeResponseBody | null, NetworkError>> {
    const timeSinceLastRequest = Date.now() - lastRequestTimestamp;
    const rateLimitDelay = Math.max(0, RATE_LIMIT_MS - timeSinceLastRequest);
    if (rateLimitDelay > 0)
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
    lastRequestTimestamp = Date.now();

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;

    const result = await safeApiCall(
        url,
        {
            headers: {
                'User-Agent':
                    'VectorVerify/1.0 (CBID surveillance application)',
                'Accept-Language': 'en',
            },
        },
        nominatimResponseSchema,
    );

    if (!result.ok) return result;

    const geocodeMatch = result.data[0];
    if (!geocodeMatch) return ok(null);

    const coordinates = {
        latitude: parseFloat(geocodeMatch.lat),
        longitude: parseFloat(geocodeMatch.lon),
    };

    const parsedResponse = getGeocodeResponseSchema.safeParse(coordinates);
    if (!parsedResponse.success)
        return err({
            kind: 'client',
            status: 400,
            message: 'invalid response',
        });

    return ok(parsedResponse.data);
}

function buildFallbackQueries(location: string): string[] {
    const parts = location
        .split(',')
        .map(part => part.trim())
        .filter(Boolean);
    if (parts.length <= 1) return [location];

    const target = parts[0];
    const ancestors = parts.slice(1);
    const broadestAncestor = parts[parts.length - 1];

    const queries: string[] = [parts.join(', ')];

    if (ancestors.length > 1) {
        queries.push(`${target}, ${broadestAncestor}`);
    }

    queries.push(ancestors.join(', '));

    return queries;
}

export async function getGeocode(
    queryParams: GetGeocodeQueryParams,
): Promise<Result<GetGeocodeResponseBody, NetworkError>> {
    const fallbackQueries = buildFallbackQueries(queryParams.location);

    for (const query of fallbackQueries) {
        const result = await nominatimSearch(query);
        if (!result.ok) return result;
        if (result.data) return ok(result.data);
    }

    return err({ kind: 'not_found', status: 404 });
}
