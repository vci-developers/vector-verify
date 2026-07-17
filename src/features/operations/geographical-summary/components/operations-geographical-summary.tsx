'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useSiteMarkers } from '@/features/operations/geographical-summary/hooks/use-site-markers';
import DeviceView from '@/features/operations/geographical-summary/components/device-view';
import type { Site } from '@/api/site/validation/site-schema';
import {
    useOperationsFilters,
    type GeographicalView,
} from '@/features/operations/view-state/use-operations-filters';
import {
    ANOPHELES_COLOR,
    ANOPHELES_THRESHOLD,
} from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import { Fragment, useRef } from 'react';

const SiteMap = dynamic(() => import('./site-map'), { ssr: false });

const GEOGRAPHICAL_VIEWS: readonly GeographicalView[] = [
    'specimens',
    'devices',
];

interface OperationsGeographicalSummaryProps {
    siteIds: number[];
    descendantsOfSelectedLocations: Site[];
    startDate: string;
    endDate: string;
    selectedMarkerId: string | null;
    setSelectedMarkerId: (value: string | null) => void;
}

export default function OperationsGeographicalSummary({
    siteIds,
    descendantsOfSelectedLocations,
    startDate,
    endDate,
    selectedMarkerId,
    setSelectedMarkerId,
}: OperationsGeographicalSummaryProps) {
    const { markers, totalSites, isPending, isError } = useSiteMarkers({
        siteIds,
        descendantsOfSelectedLocations,
        startDate,
        endDate,
    });

    const siteMapMounted = useRef(false);
    if (!isPending && markers.length > 0) siteMapMounted.current = true;

    const t = useTranslations('OperationsGeographicalSummary');
    const [{ geographicalView, selectedLocations }, setFilters] =
        useOperationsFilters();

    return (
        <div className="mt-4 space-y-3">
            <Tabs
                value={geographicalView}
                onValueChange={value =>
                    setFilters({
                        geographicalView: value as GeographicalView,
                    })
                }
            >
                <TabsList className="bg-muted/50 rounded-full p-1">
                    {GEOGRAPHICAL_VIEWS.map(view => (
                        <TabsTrigger
                            key={view}
                            value={view}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
                        >
                            {t(view)}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {geographicalView === 'devices' && (
                <DeviceView
                    siteIds={siteIds}
                    selectedLocations={selectedLocations}
                    descendantsOfSelectedLocations={
                        descendantsOfSelectedLocations
                    }
                />
            )}

            {geographicalView === 'specimens' && (
                <Fragment>
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
                            {siteMapMounted.current ? (
                                <SiteMap
                                    markers={markers}
                                    selectedLocations={selectedLocations}
                                    selectedMarkerId={selectedMarkerId}
                                    onMarkerSelect={setSelectedMarkerId}
                                />
                            ) : isPending ? (
                                <Skeleton className="h-full w-full rounded-md" />
                            ) : isError ? (
                                <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                                    Failed to load session data. Check the
                                    console for details.
                                </div>
                            ) : markers.length === 0 ? (
                                <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                                    No site data found for the selected filters.
                                </div>
                            ) : (
                                <SiteMap
                                    markers={markers}
                                    selectedLocations={selectedLocations}
                                    selectedMarkerId={selectedMarkerId}
                                    onMarkerSelect={setSelectedMarkerId}
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
                                Positioned by geocoded location name. Hover for
                                details.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-foreground font-medium">
                                Marker Size
                            </p>
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
                                            backgroundColor:
                                                ANOPHELES_COLOR.none,
                                        }}
                                    />
                                    0 / No data
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span
                                        className="inline-block h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                ANOPHELES_COLOR.low,
                                        }}
                                    />
                                    1-{ANOPHELES_THRESHOLD.low - 1}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span
                                        className="inline-block h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                ANOPHELES_COLOR.moderate,
                                        }}
                                    />
                                    {ANOPHELES_THRESHOLD.low}-
                                    {ANOPHELES_THRESHOLD.moderate - 1}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span
                                        className="inline-block h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                ANOPHELES_COLOR.high,
                                        }}
                                    />
                                    {ANOPHELES_THRESHOLD.moderate}-
                                    {ANOPHELES_THRESHOLD.high - 1}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span
                                        className="inline-block h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                ANOPHELES_COLOR.critical,
                                        }}
                                    />
                                    {ANOPHELES_THRESHOLD.high}+
                                </span>
                            </div>
                        </div>
                    </div>
                </Fragment>
            )}
        </div>
    );
}
