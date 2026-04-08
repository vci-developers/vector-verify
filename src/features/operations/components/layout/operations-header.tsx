'use client';

import MonthPicker from '@/components/ui/month-picker';
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

interface OperationsHeaderProps {
    tabs: readonly { value: OperationsTab; label: string }[];
    activeTab: OperationsTab;
    onTabChange: (tab: OperationsTab) => void;
    districts: string[];
    selectedDistrict: string;
    onDistrictChange: (district: string) => void;
    selectedMonth: Date;
    onMonthChange: (month: Date) => void;
}

export default function OperationsHeader({
    tabs,
    activeTab,
    onTabChange,
    districts,
    selectedDistrict,
    onDistrictChange,
    selectedMonth,
    onMonthChange,
}: OperationsHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Select
                    value={selectedDistrict}
                    onValueChange={onDistrictChange}
                >
                    <SelectTrigger className="w-52">
                        <SelectValue placeholder="Select a district" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>District</SelectLabel>
                            {districts.map(district => (
                                <SelectItem key={district} value={district}>
                                    {district}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <MonthPicker
                    selectedMonth={selectedMonth}
                    onMonthChange={onMonthChange}
                    maxDate={new Date()}
                />
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
