import 'server-only';

import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { z } from 'zod';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { safeApiCall } from '@/lib/network/safe-api-call';
import {
    getGeocodeResponseSchema,
    type GetGeocodeQueryParams,
    type GetGeocodeResponseBody,
} from './validation/get-geocode-schema';

countries.registerLocale(enLocale);

const nominatimResponseSchema = z.array(
    z.object({ lat: z.string(), lon: z.string() }),
);

let lastRequestTimestamp = 0;
const RATE_LIMIT_MS = 1100;

async function nominatimSearch(
    searchQuery: string,
    countryCode?: string,
): Promise<Result<GetGeocodeResponseBody | null, NetworkError>> {
    const timeSinceLastRequest = Date.now() - lastRequestTimestamp;
    const rateLimitDelay = Math.max(0, RATE_LIMIT_MS - timeSinceLastRequest);
    if (rateLimitDelay > 0)
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
    lastRequestTimestamp = Date.now();

    const countryCodeParam = countryCode
        ? `&countrycodes=${encodeURIComponent(countryCode)}`
        : '';
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1${countryCodeParam}`;

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

    const queries: string[] = [];
    for (let i = 0; i < parts.length; i++) {
        queries.push(parts.slice(i).join(', '));
    }
    return queries;
}

export async function getGeocode(
    queryParams: GetGeocodeQueryParams,
): Promise<Result<GetGeocodeResponseBody, NetworkError>> {
    const fallbackQueries = buildFallbackQueries(queryParams.location);
    const countryCode = queryParams.country
        ? countries.getAlpha2Code(queryParams.country, 'en')
        : undefined;

    for (const query of fallbackQueries) {
        const result = await nominatimSearch(query, countryCode);
        if (!result.ok) return result;
        if (result.data) return ok(result.data);
    }

    return err({ kind: 'not_found', status: 404 });
}
