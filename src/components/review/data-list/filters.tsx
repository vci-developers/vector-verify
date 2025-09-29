'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DateRangeFilter } from '@/components/annotate/tasks-list/date-range-filter';
import { DistrictFilter } from './district-filter';
import type { DateRangeOption } from '@/lib/shared/utils/date-range';
import type { DistrictOption } from '@/lib/review/types';

interface FiltersProps {
  dateRange: DateRangeOption;
  onDateRangeChange: (dateRange: DateRangeOption) => void;
  districts: DistrictOption[];
  selectedDistricts: string[];
  onDistrictsChange: (districts: string[]) => void;
  onApplyFilters: () => void;
  disabled?: boolean;
}

export function Filters({
  dateRange,
  onDateRangeChange,
  districts,
  selectedDistricts,
  onDistrictsChange,
  onApplyFilters,
  disabled = false,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <DateRangeFilter
        value={dateRange}
        onValueChange={onDateRangeChange}
        disabled={disabled}
      />

      <DistrictFilter
        districts={districts}
        selectedDistricts={selectedDistricts}
        onValueChange={onDistrictsChange}
        disabled={disabled}
      />

      <Button
        onClick={onApplyFilters}
        disabled={disabled}
        size="sm"
        className="ml-auto"
      >
        Apply Filters
      </Button>
    </div>
  );
}
