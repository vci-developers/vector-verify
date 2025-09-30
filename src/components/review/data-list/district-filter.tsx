'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DistrictOption } from '@/lib/review/types';

interface DistrictFilterProps {
  districts: DistrictOption[];
  selectedDistrict: string | null;
  onDistrictSelected: (district: string | null) => void;
  disabled?: boolean;
}

export function DistrictFilter({
  districts,
  selectedDistrict,
  onDistrictSelected,
  disabled = false,
}: DistrictFilterProps) {
  const displayValue = selectedDistrict
    ? districts.find(d => d.value === selectedDistrict)?.label ||
      'All Districts'
    : 'All Districts';

  return (
    <Select
      value={selectedDistrict || 'all'}
      onValueChange={value =>
        onDistrictSelected(value === 'all' ? null : value)
      }
      disabled={disabled}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="All Districts">{displayValue}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Districts</SelectItem>
        {districts.map(district => (
          <SelectItem key={district.value} value={district.value}>
            {district.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
