import { Button } from '@/components/ui/button';
import MonthRangePicker from '@/components/ui/month-range-picker';
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from '@/components/ui/multi-select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { OperationsTab } from '@/features/operations/components/operations-page-client';
import { Download } from 'lucide-react';

interface OperationsHeaderProps {
    tabs: readonly { value: OperationsTab; label: string }[];
    activeTab: OperationsTab;
    onTabChange: (tab: OperationsTab) => void;
    locationTypeName: string;
    locationDropdownOptions: string[];
    selectedLocations: string[];
    onLocationsChange: (locations: string[]) => void;
    startMonth: Date;
    endMonth: Date;
    onStartMonthChange: (month: Date) => void;
    onEndMonthChange: (month: Date) => void;
    onExportClick: () => void;
}

export default function OperationsHeader({
    tabs,
    activeTab,
    onTabChange,
    locationTypeName,
    locationDropdownOptions,
    selectedLocations,
    onLocationsChange,
    startMonth,
    endMonth,
    onStartMonthChange,
    onEndMonthChange,
    onExportClick,
}: OperationsHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <MultiSelect
                    values={selectedLocations}
                    onValuesChange={onLocationsChange}
                >
                    <MultiSelectTrigger className="w-52">
                        <MultiSelectValue
                            placeholder={`Select ${locationTypeName.toLocaleLowerCase()}(s)`}
                            overflowBehavior="cutoff"
                        />
                    </MultiSelectTrigger>
                    <MultiSelectContent
                        search={{
                            placeholder: `Search ${locationTypeName.toLocaleLowerCase()}s...`,
                            emptyMessage: 'No results.',
                        }}
                    >
                        <MultiSelectGroup>
                            {locationDropdownOptions.map(option => (
                                <MultiSelectItem key={option} value={option}>
                                    {option}
                                </MultiSelectItem>
                            ))}
                        </MultiSelectGroup>
                    </MultiSelectContent>
                </MultiSelect>

                <div className="flex items-center gap-2">
                    <MonthRangePicker
                        startMonth={startMonth}
                        endMonth={endMonth}
                        onStartMonthChange={onStartMonthChange}
                        onEndMonthChange={onEndMonthChange}
                        maxDate={new Date()}
                    />

                    <Button
                        variant="default"
                        disabled={selectedLocations.length === 0}
                        onClick={onExportClick}
                    >
                        <Download className="h-4 w-4" />
                        Export Data
                    </Button>
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={value => onTabChange(value as OperationsTab)}
            >
                <TabsList className="bg-muted/50 rounded-full p-1">
                    {tabs.map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}
