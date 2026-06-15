'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import SelectableInfoPanel from '@/features/operations/geographical-summary/components/selectable-info-panel';

export interface DeviceSiteRow {
    siteId: number;
    siteName: string;
    activeDeviceCount: number;
    lapsingDeviceCount: number;
}

interface DeviceInfoPanelProps {
    sites: DeviceSiteRow[];
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
    isLoading: boolean;
}

export default function DeviceInfoPanel({
    sites,
    selectedMarkerId,
    onMarkerSelect,
    isLoading,
}: DeviceInfoPanelProps) {
    const t = useTranslations('OperationsGeographicalSummary');

    return (
        <SelectableInfoPanel
            items={sites}
            getItemId={site => String(site.siteId)}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={onMarkerSelect}
            isLoading={isLoading}
            countLabel={t('sitesCount', { count: sites.length })}
            renderRow={site => (
                <Fragment>
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
                </Fragment>
            )}
        />
    );
}
