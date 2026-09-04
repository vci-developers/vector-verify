'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';

interface UserAnalyticsLabeledTabsProps<Value extends string> {
    value: Value;
    onValueChange: (value: Value) => void;
    tabs: { value: Value; labelKey: string }[];
}

export default function UserAnalyticsLabeledTabs<Value extends string>({
    value,
    onValueChange,
    tabs,
}: UserAnalyticsLabeledTabsProps<Value>) {
    const t = useTranslations('UserAnalytics');

    return (
        <Tabs
            value={value}
            onValueChange={selectedValue =>
                onValueChange(selectedValue as Value)
            }
        >
            <TabsList className="bg-muted/50 rounded-full p-1">
                {tabs.map(({ value: tabValue, labelKey }) => (
                    <TabsTrigger
                        key={tabValue}
                        value={tabValue}
                        className="rounded-full"
                    >
                        {t(labelKey)}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
