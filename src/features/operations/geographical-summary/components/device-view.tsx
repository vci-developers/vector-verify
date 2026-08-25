'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeviceActivity } from '@/features/operations/geographical-summary/hooks/use-device-activity';
import {
    buildDeviceMarkers,
    DEVICE_HEALTH_COLOR,
} from '@/features/operations/geographical-summary/utils/device-marker-helpers';
import { useCountry } from '@/features/operations/geographical-summary/context/country-context';
import type { Site } from '@/api/site/validation/site-schema';
import ErrorBanner from '@/components/ui/error-banner';

const DeviceMap = dynamic(() => import('./device-map'), { ssr: false });

interface DeviceViewProps {
    programId: number;
    siteIds: number[];
    selectedLocations: string[];
    descendantsOfSelectedLocations: Site[];
}

export default function DeviceView({
    programId,
    siteIds,
    selectedLocations,
    descendantsOfSelectedLocations,
}: DeviceViewProps) {
    const t = useTranslations('OperationsGeographicalSummary');
    const country = useCountry();
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(
        null,
    );
    const { deviceActivity, isPending, isError } = useDeviceActivity(
        programId,
        siteIds,
    );

    useEffect(() => {
        setSelectedMarkerId(null);
    }, [siteIds]);

    const deviceMarkers = useMemo(() => {
        if (!deviceActivity) return null;
        return buildDeviceMarkers(
            deviceActivity,
            descendantsOfSelectedLocations,
            country,
        ).sort(
            (firstMarker, secondMarker) =>
                secondMarker.activeDeviceCount -
                    firstMarker.activeDeviceCount ||
                secondMarker.inactiveDeviceCount -
                    firstMarker.inactiveDeviceCount,
        );
    }, [deviceActivity, descendantsOfSelectedLocations, country]);

    const deviceCounts = deviceMarkers?.reduce(
        (counts, marker) => ({
            active: counts.active + marker.activeDeviceCount,
            inactive: counts.inactive + marker.inactiveDeviceCount,
        }),
        { active: 0, inactive: 0 },
    ) || { active: 0, inactive: 0 };

    const tiers = [
        { key: 'active', count: deviceCounts.active },
        { key: 'inactive', count: deviceCounts.inactive },
    ] as const;

    return (
        <div className="space-y-3">
            {isError && <ErrorBanner message={t('deviceActivityError')} />}
            <div className="flex flex-wrap gap-3">
                {tiers.map(tier => (
                    <Card key={tier.key} className="border-border/50 w-fit">
                        <CardContent className="flex items-center gap-3 px-4">
                            <p className="text-muted-foreground text-xs">
                                {t(tier.key)}
                            </p>
                            {isPending || isError ? (
                                <Skeleton
                                    className="h-5 w-8"
                                    variant={
                                        isError ? 'destructive' : 'default'
                                    }
                                />
                            ) : (
                                <p className="text-lg leading-none font-bold">
                                    {tier.count}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-border/50 p-0">
                <CardContent className="relative h-125 p-0">
                    {isPending || isError ? (
                        <Skeleton
                            className="h-full w-full rounded-md"
                            variant={isError ? 'destructive' : 'default'}
                        />
                    ) : !deviceMarkers ||
                      deviceCounts.active + deviceCounts.inactive === 0 ? (
                        <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                            {t('noDeviceActivity')}
                        </div>
                    ) : (
                        <DeviceMap
                            markers={deviceMarkers}
                            selectedLocations={selectedLocations}
                            selectedMarkerId={selectedMarkerId}
                            onMarkerSelect={setSelectedMarkerId}
                        />
                    )}
                </CardContent>
            </Card>

            {!isPending && !isError && (
                <div className="text-muted-foreground flex flex-wrap items-start gap-8 text-xs">
                    <div className="space-y-1.5">
                        <p className="text-foreground font-medium">
                            {t('legendMarkerTitle')}
                        </p>
                        <p>{t('legendMarkerSubtitle')}</p>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-foreground font-medium">
                            {t('legendSizeTitle')}
                        </p>
                        <p>{t('legendSizeSubtitle')}</p>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-foreground font-medium">
                            {t('legendColorTitle')}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <span className="flex items-center gap-1.5">
                                <span
                                    className="inline-block h-3 w-3 rounded-full"
                                    style={{
                                        backgroundColor:
                                            DEVICE_HEALTH_COLOR.active,
                                    }}
                                />
                                {t('legendActive')}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span
                                    className="inline-block h-3 w-3 rounded-full"
                                    style={{
                                        backgroundColor:
                                            DEVICE_HEALTH_COLOR.inactive,
                                    }}
                                />
                                {t('legendInactive')}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
