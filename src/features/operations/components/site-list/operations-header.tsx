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
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OperationsHeaderProps {
    districts: string[];
    selectedDistrict: string;
    onDistrictChange: (district: string) => void;
    selectedMonth: Date;
    onMonthChange: (month: Date) => void;
}

export default function OperationsHeader({
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

            <TabsList className="bg-muted/50 rounded-full p-1">
                <TabsTrigger
                    value="sites"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium uppercase"
                >
                    Sites
                </TabsTrigger>
                <TabsTrigger
                    value="review"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium uppercase"
                >
                    Review
                </TabsTrigger>
                <TabsTrigger
                    value="metrics"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium uppercase"
                >
                    Metrics
                </TabsTrigger>
                <TabsTrigger
                    value="ai-performance"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium uppercase"
                >
                    AI Performance
                </TabsTrigger>
            </TabsList>
        </div>
    );
}
