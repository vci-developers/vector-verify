'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/utils/cn';

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
    const panelItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    useEffect(() => {
        if (!selectedMarkerId) return;
        panelItemRefs.current
            .get(selectedMarkerId)
            ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [selectedMarkerId]);

    return (
        <div className="border-border flex h-full w-72 shrink-0 flex-col border-l">
            <div className="border-border border-b px-3 py-2">
                <p className="text-sm font-medium">
                    {t('sitesCount', { count: sites.length })}
                </p>
            </div>
            <ScrollArea className="min-h-0 flex-1">
                {sites.map(site => {
                    const markerId = String(site.siteId);
                    const isSelected = selectedMarkerId === markerId;

                    return (
                        <button
                            key={site.siteId}
                            ref={panelItem => {
                                if (panelItem)
                                    panelItemRefs.current.set(
                                        markerId,
                                        panelItem,
                                    );
                                else panelItemRefs.current.delete(markerId);
                            }}
                            disabled={isLoading}
                            onClick={() =>
                                onMarkerSelect(isSelected ? null : markerId)
                            }
                            className={cn(
                                'border-border w-full border-b px-3 py-2.5 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                                isSelected
                                    ? 'bg-accent ring-primary ring-1 ring-inset'
                                    : 'hover:bg-muted/40 cursor-pointer',
                            )}
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
                        </button>
                    );
                })}
            </ScrollArea>
        </div>
    );
}
