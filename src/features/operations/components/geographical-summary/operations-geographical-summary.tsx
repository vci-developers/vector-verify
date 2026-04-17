'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { useSiteMarkers } from '@/features/operations/components/geographical-summary/hooks/use-site-markers';

export const ANOPHELES_THRESHOLD = {
    low: 10,
    moderate: 50,
    high: 100,
} as const;

export const ANOPHELES_COLOR = {
    none: 'var(--color-count-none)',
    low: 'var(--color-count-low)',
    moderate: 'var(--color-count-moderate)',
    high: 'var(--color-count-high)',
    critical: 'var(--color-count-critical)',
} as const;

// 'use client' still renders on the server during SSR
// dynamic with ssr:false is required because leaflet will fail to load on the server due to its reliance on browser APIs like window and document
const SiteMap = dynamic(() => import('./site-map'), { ssr: false });

interface OperationsGeographicalSummaryProps {
    district: string;
    startDate: string;
    endDate: string;
}

export default function OperationsGeographicalSummary({
    district,
    startDate,
    endDate,
}: OperationsGeographicalSummaryProps) {
    const {
        markers,
        totalVillages,
        isPending,
        isSpecimensPending,
        sessionsFailed,
    } = useSiteMarkers({ district, startDate, endDate });

    return (
        <div className="mt-4 space-y-3">
            <Card className="border-border/50 w-fit">
                <CardContent className="flex items-center gap-3 px-4">
                    <p className="text-muted-foreground text-xs">
                        Unique Villages
                    </p>
                    {isSpecimensPending ? (
                        <Skeleton className="h-5 w-8" />
                    ) : (
                        <p className="text-lg leading-none font-bold">
                            {totalVillages}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card className="border-border/50 p-0">
                <CardContent className="relative h-125 p-0">
                    {isPending ? (
                        <Skeleton className="h-full w-full rounded-md" />
                    ) : sessionsFailed ? (
                        <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                            Failed to load session data. Check the console for
                            details.
                        </div>
                    ) : markers.length === 0 ? (
                        <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                            No village data found for the selected filters.
                        </div>
                    ) : (
                        <SiteMap markers={markers} district={district} />
                    )}
                </CardContent>
            </Card>

            <div className="text-muted-foreground flex flex-wrap items-start gap-8 text-xs">
                <div className="space-y-1.5">
                    <p className="text-foreground font-medium">
                        Each marker represents a village
                    </p>
                    <p>
                        Positioned by geocoded village name. Hover for details.
                    </p>
                </div>
                <div className="space-y-1.5">
                    <p className="text-foreground font-medium">Marker Size</p>
                    <p>Scaled by total specimen count</p>
                </div>
                <div className="space-y-1.5">
                    <p className="text-foreground font-medium">
                        Marker Color — Anopheles Count
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1.5">
                            <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{
                                    backgroundColor: ANOPHELES_COLOR.none,
                                }}
                            />
                            0 / No data
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{ backgroundColor: ANOPHELES_COLOR.low }}
                            />
                            1–{ANOPHELES_THRESHOLD.low - 1}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{
                                    backgroundColor: ANOPHELES_COLOR.moderate,
                                }}
                            />
                            {ANOPHELES_THRESHOLD.low}–
                            {ANOPHELES_THRESHOLD.moderate - 1}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{
                                    backgroundColor: ANOPHELES_COLOR.high,
                                }}
                            />
                            {ANOPHELES_THRESHOLD.moderate}–
                            {ANOPHELES_THRESHOLD.high - 1}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{
                                    backgroundColor: ANOPHELES_COLOR.critical,
                                }}
                            />
                            {ANOPHELES_THRESHOLD.high}+
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
