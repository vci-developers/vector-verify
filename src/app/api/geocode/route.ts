import { NextResponse } from 'next/server';
import { z } from 'zod';

const geocodeQueryParamsSchema = z.object({
    village: z.string().optional(),
    parish: z.string().optional(),
    subCounty: z.string().optional(),
    district: z.string().optional(),
    query: z.string().optional(),
});

type CacheEntry = {
    lat: number | null;
    lng: number | null;
    ts: number;
};

const geocodeCache = new Map<string, CacheEntry>();
const CACHE_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days

let lastRequestAt = 0;
const MIN_INTERVAL_MS = 1100;

async function nominatimSearch(
    searchQuery: string,
): Promise<{ lat: number; lng: number } | null> {
    const cached = geocodeCache.get(searchQuery);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.lat != null && cached.lng != null
            ? { lat: cached.lat, lng: cached.lng }
            : null;
    }

    const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt));
    if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
    lastRequestAt = Date.now();

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'VectorVerify/1.0 (CBID surveillance application)',
            'Accept-Language': 'en',
        },
    });

    if (!res.ok) {
        return null;
    }

    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (Array.isArray(data) && data[0]) {
        const result = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
        };
        geocodeCache.set(searchQuery, { ...result, ts: Date.now() });
        return result;
    }

    geocodeCache.set(searchQuery, { lat: null, lng: null, ts: Date.now() });
    return null;
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

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);

        const parsed = geocodeQueryParamsSchema.safeParse(
            Object.fromEntries(url.searchParams.entries()),
        );
        if (!parsed.success) {
            return NextResponse.json(
                { ok: false, error: 'Invalid query parameters' },
                { status: 400 },
            );
        }

        const { village, parish, subCounty, district, query } = parsed.data;

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
            return NextResponse.json(
                { ok: false, error: 'missing query' },
                { status: 400 },
            );
        }

        for (const searchQuery of queries) {
            const result = await nominatimSearch(searchQuery);
            if (result) {
                return NextResponse.json({
                    ok: true,
                    lat: result.lat,
                    lng: result.lng,
                });
            }
        }

        return NextResponse.json(
            { ok: false, reason: 'not_found' },
            { status: 404 },
        );
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 },
        );
    }
}
