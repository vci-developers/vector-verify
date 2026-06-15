'use client';

import { useTranslations } from 'next-intl';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface DeviceSiteRow {
    siteId: number;
    siteName: string;
    activeDeviceCount: number;
    lapsingDeviceCount: number;
}

interface DeviceInfoPanelProps {
    sites: DeviceSiteRow[];
}

export default function DeviceInfoPanel({ sites }: DeviceInfoPanelProps) {
    const t = useTranslations('OperationsGeographicalSummary');

    return (
        <div className="border-border flex h-full w-full flex-col">
            <div className="border-border border-b px-3 py-2">
                <p className="text-sm font-medium">
                    {t('sitesCount', { count: sites.length })}
                </p>
            </div>
            <ScrollArea className="min-h-0 flex-1">
                {sites.map(site => (
                    <div
                        key={site.siteId}
                        className="border-border border-b px-3 py-2.5 text-xs"
                    >
                        <p className="font-semibold">{site.siteName}</p>
                        <div className="text-muted-foreground mt-1.5 space-y-0.5">
                            <p>
                                {t('siteActiveCount', {
                                    count: site.activeDeviceCount,
                                })}
                            </p>
                            <p>
                                {t('siteLapsingCount', {
                                    count: site.lapsingDeviceCount,
                                })}
                            </p>
                        </div>
                    </div>
                ))}
            </ScrollArea>
        </div>
    );
}
