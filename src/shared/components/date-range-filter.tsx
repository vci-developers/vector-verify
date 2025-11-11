'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { Calendar } from 'lucide-react';
import {
  DATE_RANGE_OPTIONS,
  type DateRangeOption,
} from '@/shared/core/utils/date-range';

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
      <Calendar className="text-muted-foreground h-4 w-4" />
      <Select
        value={value ?? 'all-time'}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[180px]">
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
