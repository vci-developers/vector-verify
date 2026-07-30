'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ActiveMetricsRangePreset } from '@/components/user-analytics/build-active-metrics-range';
import { useTranslations } from 'next-intl';

interface UserAnalyticsRangeTabsProps {
    value: ActiveMetricsRangePreset;
    onValueChange: (value: ActiveMetricsRangePreset) => void;
}

const RANGE_PRESET_TABS: {
    preset: ActiveMetricsRangePreset;
    labelKey: string;
}[] = [
    { preset: '30d', labelKey: 'range30d' },
    { preset: '90d', labelKey: 'range90d' },
    { preset: '1y', labelKey: 'range1y' },
];

export default function UserAnalyticsRangeTabs({
    value,
    onValueChange,
}: UserAnalyticsRangeTabsProps) {
    const t = useTranslations('UserAnalytics');

    return (
        <Tabs
            value={value}
            onValueChange={selectedValue =>
                onValueChange(selectedValue as ActiveMetricsRangePreset)
            }
        >
            <TabsList className="bg-muted/50 rounded-full p-1">
                {RANGE_PRESET_TABS.map(({ preset, labelKey }) => (
                    <TabsTrigger
                        key={preset}
                        value={preset}
                        className="rounded-full"
                    >
                        {t(labelKey)}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
