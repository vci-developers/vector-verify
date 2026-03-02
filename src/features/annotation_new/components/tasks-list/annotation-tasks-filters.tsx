'use client';

import {
    annotationTaskStatusSchema,
    type AnnotationTaskStatus,
} from '@/api/annotation-task/validation/annotation-task-schema';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

interface AnnotationTasksFiltersProps {
    status: AnnotationTaskStatus;
    dateRange: DateRange | undefined;
    onStatusChange: (status: AnnotationTaskStatus) => void;
    onDateRangeChange: (dateRange: DateRange | undefined) => void;
    onClearDateRange: () => void;
}

export default function AnnotationTasksFilters({
    status,
    dateRange,
    onStatusChange,
    onDateRangeChange,
    onClearDateRange,
}: AnnotationTasksFiltersProps) {
    const hasDateFilter = dateRange?.from || dateRange?.to;

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
                value={status}
                onValueChange={value =>
                    onStatusChange(value as AnnotationTaskStatus)
                }
            >
                <TabsList className="bg-muted/50">
                    {annotationTaskStatusSchema.options.map(statusOption => (
                        <TabsTrigger
                            key={statusOption}
                            value={statusOption}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            {statusOption.replaceAll('_', ' ')}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={hasDateFilter ? 'default' : 'outline'}
                            className="gap-2"
                        >
                            {!dateRange?.from && !dateRange?.to
                                ? 'Filter by date range'
                                : `${dateRange.from ? format(dateRange.from, 'MM/dd/yyyy') : '...'} - ${dateRange.to ? format(dateRange.to, 'MM/dd/yyyy') : '...'}`}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="range"
                            numberOfMonths={2}
                            selected={dateRange}
                            onSelect={onDateRangeChange}
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
    );
}
