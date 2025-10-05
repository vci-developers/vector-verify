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

// Constants
const SELECT_VALUES = {
  ALL_DISTRICTS: 'all',
} as const;

const STYLES = {
  SELECT_WIDTH: 'w-48',
} as const;

interface DistrictFilterProps {
  districts: DistrictOption[];
  selectedDistrict: string | null;
  onDistrictSelected: (district: string | null) => void;
  disabled?: boolean;
}

/**
 * Handles district selection change by converting 'all' to null
 */
function handleDistrictChange(
  value: string,
  onDistrictSelected: (district: string | null) => void,
): void {
  const district = value === SELECT_VALUES.ALL_DISTRICTS ? null : value;
  onDistrictSelected(district);
}

/**
 * Renders district options in the select dropdown
 */
function renderDistrictOptions(districts: DistrictOption[]) {
  return districts.map(district => (
    <SelectItem key={district.value} value={district.value}>
      {district.label}
    </SelectItem>
  ));
}

/**
 * District filter component for selecting districts
 * Receives pre-filtered districts from parent component
 */
export function DistrictFilter({
  districts,
  selectedDistrict,
  onDistrictSelected,
  disabled = false,
}: DistrictFilterProps) {
  const effectiveSelectedDistrict =
    selectedDistrict || SELECT_VALUES.ALL_DISTRICTS;

  return (
    <Select
      value={effectiveSelectedDistrict}
      onValueChange={value => handleDistrictChange(value, onDistrictSelected)}
      disabled={disabled}
    >
      <SelectTrigger className={STYLES.SELECT_WIDTH}>
        <SelectValue placeholder="All Districts" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={SELECT_VALUES.ALL_DISTRICTS}>
          All Districts
        </SelectItem>
        {renderDistrictOptions(districts)}
      </SelectContent>
    </Select>
  );
}
