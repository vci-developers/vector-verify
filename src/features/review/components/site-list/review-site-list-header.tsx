'use client';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface ReviewSiteListHeaderProps {
    districts: string[];
    selectedDistrict: string | null;
    onDistrictChange: (district: string | null) => void;
    selectedMonth: Date;
    onMonthChange: (month: Date) => void;
}

export default function ReviewSiteListHeader({
    districts,
    selectedDistrict,
    onDistrictChange,
    selectedMonth,
    onMonthChange,
}: ReviewSiteListHeaderProps) {
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(selectedMonth.getFullYear());

    function goToPreviousYear() {
        setViewYear(year => year - 1);
    }

    function goToNextYear() {
        setViewYear(year => year + 1);
    }

    function selectMonth(monthIndex: number) {
        onMonthChange(new Date(viewYear, monthIndex, 1));
        setOpen(false);
    }

    return (
        <div className="flex items-center justify-between">
            <Select
                value={selectedDistrict ?? ''}
                onValueChange={value => onDistrictChange(value || null)}
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

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-44 justify-start gap-2">
                        <CalendarIcon className="h-4 w-4 shrink-0" />
                        {format(selectedMonth, 'MMMM yyyy')}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="end">
                    <div className="flex items-center justify-between mb-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToPreviousYear}
                            aria-label="Previous year"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">{viewYear}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToNextYear}
                            aria-label="Next year"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        {MONTHS.map((month, index) => (
                            <Button
                                key={month}
                                variant={
                                    selectedMonth.getMonth() === index &&
                                    selectedMonth.getFullYear() === viewYear
                                        ? 'default'
                                        : 'ghost'
                                }
                                size="sm"
                                className="h-8"
                                onClick={() => selectMonth(index)}
                            >
                                {month}
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
