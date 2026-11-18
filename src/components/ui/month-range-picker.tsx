import MonthPicker from '@/components/ui/month-picker';
import { cn } from '@/utils/cn';

interface MonthRangePickerProps {
    startMonth: Date;
    endMonth: Date;
    onStartMonthChange: (month: Date) => void;
    onEndMonthChange: (month: Date) => void;
    maxDate?: Date;
    className?: string;
}

export default function MonthRangePicker({
    startMonth,
    endMonth,
    onStartMonthChange,
    onEndMonthChange,
    maxDate,
    className,
}: MonthRangePickerProps) {
    function handleStartMonthChange(month: Date) {
        onStartMonthChange(month);
        if (month > endMonth) {
            onEndMonthChange(month);
        }
    }

    function handleEndMonthChange(month: Date) {
        onEndMonthChange(month);
        if (month < startMonth) {
            onStartMonthChange(month);
        }
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <MonthPicker
                selectedMonth={startMonth}
                onMonthChange={handleStartMonthChange}
                maxDate={endMonth}
            />
            <span className="text-muted-foreground text-sm">to</span>
            <MonthPicker
                selectedMonth={endMonth}
                onMonthChange={handleEndMonthChange}
                minDate={startMonth}
                maxDate={maxDate}
            />
        </div>
    );
}
