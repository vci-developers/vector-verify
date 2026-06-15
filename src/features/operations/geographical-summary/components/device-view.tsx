'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import DeviceInfoPanel, {
    type DeviceSiteRow,
} from '@/features/operations/geographical-summary/components/device-info-panel';
import { useDeviceActivity } from '@/features/operations/geographical-summary/hooks/use-device-activity';
import type { LocationQueryParam } from '@/lib/location/location-query';
import type { Site } from '@/api/site/validation/site-schema';

interface DeviceViewProps {
    locationQueryParam: LocationQueryParam;
    descendantsOfSelectedLocation: Site[];
}

export default function DeviceView({
    locationQueryParam,
    descendantsOfSelectedLocation,
}: DeviceViewProps) {
    const t = useTranslations('OperationsGeographicalSummary');
    const { deviceActivity, isPending, isError } =
        useDeviceActivity(locationQueryParam);

    const siteNameById = useMemo(
        () =>
            new Map(
                descendantsOfSelectedLocation.map(site => [
                    site.siteId,
                    site.name ?? site.villageName ?? null,
                ]),
            ),
        [descendantsOfSelectedLocation],
    );

    const siteRows = useMemo((): DeviceSiteRow[] => {
        if (!deviceActivity) return [];
        return deviceActivity.sites
            .map(site => ({
                siteId: site.siteId,
                siteName: siteNameById.get(site.siteId) ?? t('unknownSite'),
                activeDeviceCount: site.activeDeviceCount,
                lapsingDeviceCount: site.lapsingDeviceCount,
            }))
            .sort(
                (firstSite, secondSite) =>
                    secondSite.activeDeviceCount -
                        firstSite.activeDeviceCount ||
                    secondSite.lapsingDeviceCount -
                        firstSite.lapsingDeviceCount,
            );
    }, [deviceActivity, siteNameById, t]);

    if (isPending) {
        return (
            <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-20 w-44" />
                    <Skeleton className="h-20 w-44" />
                    <Skeleton className="h-20 w-44" />
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

    if (!deviceActivity || deviceActivity.totalDevices === 0) {
        return (
            <Card className="border-border/50 p-0">
                <CardContent className="text-muted-foreground flex h-125 items-center justify-center p-0 text-sm">
                    {t('noDeviceActivity')}
                </CardContent>
            </Card>
        );
    }

    const tiers = [
        {
            key: 'active',
            count: deviceActivity.activeDevices,
            caption: t('activeCaption'),
        },
        {
            key: 'lapsing',
            count: deviceActivity.lapsingDevices,
            caption: t('lapsingCaption'),
        },
        {
            key: 'inactive',
            count: deviceActivity.inactiveDevices,
            caption: t('inactiveCaption'),
        },
    ] as const;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
                {tiers.map(tier => (
                    <Card key={tier.key} className="border-border/50 w-44">
                        <CardContent className="space-y-1 px-4">
                            <p className="text-muted-foreground text-xs">
                                {t(tier.key)}
                            </p>
                            <p className="text-2xl leading-none font-bold">
                                {tier.count}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {tier.caption}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-border/50 p-0">
                <CardContent className="h-125 p-0">
                    <DeviceInfoPanel sites={siteRows} />
                </CardContent>
            </Card>
        </div>
    );
}