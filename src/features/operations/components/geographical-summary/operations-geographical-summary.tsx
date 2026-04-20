'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { useSiteMarkers } from '@/features/operations/components/geographical-summary/hooks/use-site-markers';
import type { Site } from '@/api/site/validation/site-schema';
import type { LocationQueryParam } from '@/lib/location/location-query';
import {
    ANOPHELES_COLOR,
    ANOPHELES_THRESHOLD,
} from '../../utils/site-marker-data';

const SiteMap = dynamic(() => import('./site-map'), { ssr: false });

interface OperationsGeographicalSummaryProps {
    locationQueryParam: LocationQueryParam;
    selectedLocation: string;
    sites: Site[];
    startDate: string;
    endDate: string;
}

export default function OperationsGeographicalSummary({
    locationQueryParam,
    selectedLocation,
    sites,
    startDate,
    endDate,
}: OperationsGeographicalSummaryProps) {
    const { markers, totalSites, isPending, isError } = useSiteMarkers({
        locationQueryParam,
        sites,
        startDate,
        endDate,
    });

    return (
        <div className="mt-4 space-y-3">
            <Card className="border-border/50 w-fit">
                <CardContent className="flex items-center gap-3 px-4">
                    <p className="text-muted-foreground text-xs">
                        Unique Sites
                    </p>
                    {isPending ? (
                        <Skeleton className="h-5 w-8" />
                    ) : (
                        <p className="text-lg leading-none font-bold">
                            {totalSites}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card className="border-border/50 p-0">
                <CardContent className="relative h-125 p-0">
                    {isPending ? (
                        <Skeleton className="h-full w-full rounded-md" />
                    ) : isError ? (
                        <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                            Failed to load session data. Check the console for
                            details.
                        </div>
                    ) : markers.length === 0 ? (
                        <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                            No site data found for the selected filters.
                        </div>
                    ) : (
                        <SiteMap
                            markers={markers}
                            selectedLocation={selectedLocation}
                        />
                    )}
                </CardContent>
            </Card>

            <div className="text-muted-foreground flex flex-wrap items-start gap-8 text-xs">
                <div className="space-y-1.5">
                    <p className="text-foreground font-medium">
                        Each marker represents a collection site
                    </p>
                    <p>
                        Positioned by geocoded location name. Hover for details.
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
                            1-{ANOPHELES_THRESHOLD.low - 1}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{
                                    backgroundColor: ANOPHELES_COLOR.moderate,
                                }}
                            />
                            {ANOPHELES_THRESHOLD.low}-
                            {ANOPHELES_THRESHOLD.moderate - 1}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{
                                    backgroundColor: ANOPHELES_COLOR.high,
                                }}
                            />
                            {ANOPHELES_THRESHOLD.moderate}-
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
