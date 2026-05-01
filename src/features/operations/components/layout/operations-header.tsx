import { Button } from '@/components/ui/button';
import MonthRangePicker from '@/components/ui/month-range-picker';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { OperationsTab } from '@/features/operations/components/page-client/operations-page-client';
import { Download } from 'lucide-react';

interface OperationsHeaderProps {
    tabs: readonly { value: OperationsTab; label: string }[];
    activeTab: OperationsTab;
    onTabChange: (tab: OperationsTab) => void;
    locationTypeName: string;
    locationDropdownOptions: string[];
    selectedLocation: string;
    onLocationChange: (location: string) => void;
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
    selectedLocation,
    onLocationChange,
    startMonth,
    endMonth,
    onStartMonthChange,
    onEndMonthChange,
    onExportClick,
}: OperationsHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Select
                    value={selectedLocation}
                    onValueChange={onLocationChange}
                >
                    <SelectTrigger className="w-52">
                        <SelectValue
                            placeholder={`Select a ${locationTypeName.toLowerCase()}`}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>{locationTypeName}</SelectLabel>
                            {locationDropdownOptions.map(option => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

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
                        disabled={!selectedLocation}
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
