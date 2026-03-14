'use client';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

interface MonthPickerProps {
    selectedMonth: Date;
    onMonthChange: (month: Date) => void;
    minDate?: Date;
    maxDate?: Date;
}

export default function MonthPicker({
    selectedMonth,
    onMonthChange,
    minDate,
    maxDate,
}: MonthPickerProps) {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [viewYear, setViewYear] = useState(selectedMonth.getFullYear());

    function handlePopoverOpenChange(open: boolean) {
        setPopoverOpen(open);
        if (open) {
            setViewYear(selectedMonth.getFullYear());
        }
    }

    function goToPreviousYear() {
        setViewYear(year => year - 1);
    }

    function goToNextYear() {
        setViewYear(year => year + 1);
    }

    function isMonthDisabled(monthIndex: number): boolean {
        const isTooEarly =
            minDate &&
            (viewYear < minDate.getFullYear() ||
                (viewYear === minDate.getFullYear() &&
                    monthIndex < minDate.getMonth()));

        const isTooLate =
            maxDate &&
            (viewYear > maxDate.getFullYear() ||
                (viewYear === maxDate.getFullYear() &&
                    monthIndex > maxDate.getMonth()));

        return !!isTooEarly || !!isTooLate;
    }

    function selectMonth(monthIndex: number) {
        onMonthChange(new Date(viewYear, monthIndex, 1));
        setPopoverOpen(false);
    }

    return (
        <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-44 justify-start gap-2">
                    <CalendarIcon className="h-4 w-4 shrink-0" />
                    {format(selectedMonth, 'MMMM yyyy')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
                <div className="mb-3 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPreviousYear}
                        disabled={
                            !!minDate && viewYear <= minDate.getFullYear()
                        }
                        aria-label="Previous year"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">{viewYear}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextYear}
                        disabled={
                            !!maxDate && viewYear >= maxDate.getFullYear()
                        }
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
                            disabled={isMonthDisabled(index)}
                            onClick={() => selectMonth(index)}
                        >
                            {month}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
