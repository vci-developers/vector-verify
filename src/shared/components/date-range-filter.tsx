'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import {
  DATE_RANGE_OPTIONS,
  type DateRangeOption,
} from '@/lib/shared/utils/date-range';

interface DateRangeFilterProps {
  value?: DateRangeOption;
  onValueChange: (value: DateRangeOption) => void;
  disabled?: boolean;
}

export function DateRangeFilter({
  value,
  onValueChange,
  disabled = false,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="date-range"
        className="text-muted-foreground text-sm font-medium"
      >
        Date Range:
      </label>
      <Select
        value={value ?? 'all-time'}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id="date-range" className="w-[180px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {DATE_RANGE_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
