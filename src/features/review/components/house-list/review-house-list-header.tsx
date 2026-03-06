'use client';

import { Button } from '@/components/ui/button';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewHouseListHeaderProps {
    districts: string[];
    selectedDistrict: string | null;
    onDistrictChange: (district: string | null) => void;
    selectedMonth: Date;
    onMonthChange: (month: Date) => void;
}

export default function ReviewHouseListHeader({
    districts,
    selectedDistrict,
    onDistrictChange,
    selectedMonth,
    onMonthChange,
}: ReviewHouseListHeaderProps) {
    function goToPrevMonth() {
        onMonthChange(
            new Date(
                selectedMonth.getFullYear(),
                selectedMonth.getMonth() - 1,
                1,
            ),
        );
    }

    function goToNextMonth() {
        onMonthChange(
            new Date(
                selectedMonth.getFullYear(),
                selectedMonth.getMonth() + 1,
                1,
            ),
        );
    }

    return (
        <div className="flex items-center justify-between">
            <Select
                value={selectedDistrict ?? ''}
                onValueChange={val => onDistrictChange(val || null)}
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

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPrevMonth}
                    aria-label="Previous month"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="w-36 text-center text-sm font-medium">
                    {format(selectedMonth, 'MMMM yyyy')}
                </span>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextMonth}
                    aria-label="Next month"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
