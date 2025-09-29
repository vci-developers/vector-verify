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
  selectedDistricts: string[];
  onValueChange: (districts: string[]) => void;
  disabled?: boolean;
}

export function DistrictFilter({
  districts,
  selectedDistricts,
  onValueChange,
  disabled = false,
}: DistrictFilterProps) {
  const handleValueChange = (value: string) => {
    if (value === 'all') {
      onValueChange([]);
    } else {
      onValueChange([value]);
    }
  };

  const displayValue =
    selectedDistricts.length === 0
      ? 'All Districts'
      : selectedDistricts.length === 1
        ? districts.find(d => d.value === selectedDistricts[0])?.label ||
          'All Districts'
        : `${selectedDistricts.length} districts selected`;

  return (
    <Select
      value={selectedDistricts.length === 0 ? 'all' : selectedDistricts[0]}
      onValueChange={handleValueChange}
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
