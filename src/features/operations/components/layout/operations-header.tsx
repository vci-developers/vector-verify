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
    districts: string[];
    selectedDistrict: string;
    onDistrictChange: (district: string) => void;
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
    districts,
    selectedDistrict,
    onDistrictChange,
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
                        disabled={!selectedDistrict}
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
