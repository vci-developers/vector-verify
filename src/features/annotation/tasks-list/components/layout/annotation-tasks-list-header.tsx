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

interface AnnotationTasksListHeaderProps {
    status: AnnotationTaskStatus;
    dateRange: DateRange | undefined;
    onStatusChange: (status: AnnotationTaskStatus) => void;
    onDateRangeChange: (dateRange: DateRange | undefined) => void;
    onClearDateRange: () => void;
}

export default function AnnotationTasksListHeader({
    status,
    dateRange,
    onStatusChange,
    onDateRangeChange,
    onClearDateRange,
}: AnnotationTasksListHeaderProps) {
    const hasDateFilter = dateRange?.from || dateRange?.to;

    return (
        <div className="mb-6 flex items-center justify-between">
            <Tabs
                value={status}
                onValueChange={value =>
                    onStatusChange(value as AnnotationTaskStatus)
                }
            >
                <TabsList className="bg-muted/50 rounded-full p-1">
                    {annotationTaskStatusSchema.options.map(statusOption => (
                        <TabsTrigger
                            key={statusOption}
                            value={statusOption}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
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
                                ? 'Filter by date when task was assigned'
                                : `${dateRange.from ? format(dateRange.from, 'dd MMMM yyyy') : '...'} - ${dateRange.to ? format(dateRange.to, 'dd MMMM yyyy') : '...'}`}
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
