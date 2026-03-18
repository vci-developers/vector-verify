'use client';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OperationsDataHeaderProps {
    districts: string[];
    selectedDistrict: string;
    onDistrictChange: (district: string) => void;
    dateRange: DateRange | undefined;
    onDateRangeChange: (dateRange: DateRange | undefined) => void;
    onClearDateRange: () => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function OperationsDataHeader({
    activeTab,
    onTabChange,
    districts,
    selectedDistrict,
    onDistrictChange,
    dateRange,
    onDateRangeChange,
    onClearDateRange,
}: OperationsDataHeaderProps) {
    const hasDateFilter = dateRange?.from || dateRange?.to;

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
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={hasDateFilter ? 'default' : 'outline'}
                                className="gap-2"
                            >
                                {!dateRange?.from && !dateRange?.to
                                    ? 'Filter by date'
                                    : `${dateRange.from ? format(dateRange.from, 'dd MMMM yyyy') : '...'} - ${dateRange.to ? format(dateRange.to, 'dd MMMM yyyy') : '...'}`}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="range"
                                numberOfMonths={2}
                                selected={dateRange}
                                onSelect={onDateRangeChange}
                                defaultMonth={dateRange?.to ?? dateRange?.from}
                                disabled={{ after: new Date() }}
                                autoFocus
                            />
                        </PopoverContent>
                    </Popover>

                    {hasDateFilter && (
                        <Button
                            variant="outline"
                            onClick={onClearDateRange}
                            size="icon"
                            className="text-muted-foreground hover:text-foreground h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList className="bg-muted/50 rounded-full p-1">
                    <TabsTrigger
                        value="sites"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium uppercase"
                    >
                        Sites
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
