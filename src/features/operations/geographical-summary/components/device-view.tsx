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
import type { LocationQueryParam } from '@/lib/location/location-query';
import type { Site } from '@/api/site/validation/site-schema';

const DeviceMap = dynamic(() => import('./device-map'), { ssr: false });

interface DeviceViewProps {
    locationQueryParam: LocationQueryParam;
    selectedLocation: string;
    descendantsOfSelectedLocation: Site[];
}

export default function DeviceView({
    locationQueryParam,
    selectedLocation,
    descendantsOfSelectedLocation,
}: DeviceViewProps) {
    const t = useTranslations('OperationsGeographicalSummary');
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(
        null,
    );
    const { deviceActivity, isPending, isError } =
        useDeviceActivity(locationQueryParam);

    useEffect(() => {
        setSelectedMarkerId(null);
    }, [locationQueryParam]);

    const deviceMarkers = useMemo(() => {
        if (!deviceActivity) return [];
        return buildDeviceMarkers(
            deviceActivity.sites,
            descendantsOfSelectedLocation,
        ).sort(
            (firstMarker, secondMarker) =>
                secondMarker.activeDeviceCount -
                    firstMarker.activeDeviceCount ||
                secondMarker.lapsingDeviceCount -
                    firstMarker.lapsingDeviceCount,
        );
    }, [deviceActivity, descendantsOfSelectedLocation]);

    if (isPending) {
        return (
            <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-13 w-28" />
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

    if (!deviceActivity || deviceActivity.totalDeviceCount === 0) {
        return (
            <Card className="border-border/50 p-0">
                <CardContent className="text-muted-foreground flex h-125 items-center justify-center p-0 text-sm">
                    {t('noDeviceActivity')}
                </CardContent>
            </Card>
        );
    }

    const tiers = [
        { key: 'active', count: deviceActivity.activeDeviceCount },
        { key: 'lapsing', count: deviceActivity.lapsingDeviceCount },
        { key: 'inactive', count: deviceActivity.inactiveDeviceCount },
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
                        markers={deviceMarkers}
                        selectedLocation={selectedLocation}
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
                                        DEVICE_HEALTH_COLOR.lapsing,
                                }}
                            />
                            {t('legendLapsing')}
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
