import MonthPicker from '@/components/ui/month-picker';

interface MonthRangePickerProps {
    startMonth: Date;
    endMonth: Date;
    onStartMonthChange: (month: Date) => void;
    onEndMonthChange: (month: Date) => void;
    maxDate?: Date;
}

export default function MonthRangePicker({
    startMonth,
    endMonth,
    onStartMonthChange,
    onEndMonthChange,
    maxDate,
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
        <div className="flex items-center gap-2">
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
