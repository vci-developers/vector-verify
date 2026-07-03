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
import type { Site } from '@/api/site/validation/site-schema';

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

    const mappedDeviceActivity = useMemo(() => {
        if (!deviceActivity) return null;
        const mapped = buildDeviceMarkers(
            deviceActivity.sites,
            descendantsOfSelectedLocations,
        );
        return {
            ...mapped,
            markers: [...mapped.markers].sort(
                (firstMarker, secondMarker) =>
                    secondMarker.activeDeviceCount -
                        firstMarker.activeDeviceCount ||
                    secondMarker.inactiveDeviceCount -
                        firstMarker.inactiveDeviceCount,
            ),
        };
    }, [deviceActivity, descendantsOfSelectedLocations]);

    if (isPending) {
        return (
            <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-13 w-28" />
                    <Skeleton className="h-13 w-28" />
                </div>
                <Skeleton className="h-125 w-full rounded-md" />
            </div>
        );
    }

    if (isError) {
        return (
            <Card className="border-border/50 p-0">
                <CardContent className="text-muted-foreground flex h-125 items-center justify-center p-0 text-sm">
                    {t('deviceActivityError')}
                </CardContent>
            </Card>
        );
    }

    if (!mappedDeviceActivity || mappedDeviceActivity.totalDeviceCount === 0) {
        return (
            <Card className="border-border/50 p-0">
                <CardContent className="text-muted-foreground flex h-125 items-center justify-center p-0 text-sm">
                    {t('noDeviceActivity')}
                </CardContent>
            </Card>
        );
    }

    const tiers = [
        { key: 'active', count: mappedDeviceActivity.activeDeviceCount },
        { key: 'inactive', count: mappedDeviceActivity.inactiveDeviceCount },
    ] as const;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
                {tiers.map(tier => (
                    <Card key={tier.key} className="border-border/50 w-fit">
                        <CardContent className="flex items-center gap-3 px-4">
                            <p className="text-muted-foreground text-xs">
                                {t(tier.key)}
                            </p>
                            <p className="text-lg leading-none font-bold">
                                {tier.count}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-border/50 p-0">
                <CardContent className="relative h-125 p-0">
                    <DeviceMap
                        markers={mappedDeviceActivity.markers}
                        selectedLocations={selectedLocations}
                        selectedMarkerId={selectedMarkerId}
                        onMarkerSelect={setSelectedMarkerId}
                    />
                </CardContent>
            </Card>

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
                                    backgroundColor: DEVICE_HEALTH_COLOR.active,
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
        </div>
    );
}
