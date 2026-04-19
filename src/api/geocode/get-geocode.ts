import 'server-only';

import { z } from 'zod';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import type {
    GeocodeCoordinates,
    GeocodeQueryParams,
} from './validation/get-geocode-schema';
import { safeApiCall } from '@/lib/network/safe-api-call';

export type { GeocodeCoordinates };

// Not extracted to validation/ — only used internally to validate the external Nominatim response
const nominatimResponseSchema = z.array(
    z.object({ lat: z.string(), lon: z.string() }),
);

let lastRequestAt = 0;
const MIN_INTERVAL_MS = 1100;

async function nominatimSearch(
    searchQuery: string,
): Promise<Result<GeocodeCoordinates | null, NetworkError>> {
    const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt));
    if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
    lastRequestAt = Date.now();

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

    if (!result.ok) return ok(null);

    const geocodeMatch = result.data[0];
    if (!geocodeMatch) return ok(null);

    return ok({
        latitude: parseFloat(geocodeMatch.lat),
        longitude: parseFloat(geocodeMatch.lon),
    });
}

function buildFallbackQueries(
    villageName: string | null,
    parish: string | null,
    subCounty: string | null,
    district: string | null,
): string[] {
    const districtPart = district ? `${district} District, Uganda` : 'Uganda';
    const queries: string[] = [];

    if (villageName && parish)
        queries.push(`${villageName}, ${parish} Parish, ${districtPart}`);
    if (villageName) queries.push(`${villageName}, ${districtPart}`);
    if (parish) queries.push(`${parish} Parish, ${districtPart}`);
    if (subCounty) queries.push(`${subCounty}, ${districtPart}`);
    queries.push(districtPart);

    return [...new Set(queries)];
}

export async function getGeocode(
    params: GeocodeQueryParams,
): Promise<Result<GeocodeCoordinates, NetworkError>> {
    const { village, parish, subCounty, district, query } = params;

    const queries =
        village || parish || subCounty || district
            ? buildFallbackQueries(
                  village ?? null,
                  parish ?? null,
                  subCounty ?? null,
                  district ?? null,
              )
            : query
              ? [query]
              : null;

    if (!queries) {
        return err({ kind: 'client', status: 400, message: 'missing query' });
    }

    for (const searchQuery of queries) {
        const result = await nominatimSearch(searchQuery);
        if (!result.ok) return result;
        if (result.data) return ok(result.data);
    }

    return err({ kind: 'not_found', status: 404 });
}
