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
import type { User } from '@/lib/entities/user/model';
import type { UserPermissions } from '@/lib/entities/user/permissions';
import { useDistrictFilter } from '@/lib/review/hooks/use-district-filter';

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
  user?: User;
  permissions?: UserPermissions;
  siteDistrictsMap?: Map<number, string>;
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
 * Determines the effective selected district value for the select component
 */
function getEffectiveSelectedDistrict(
  selectedDistrict: string | null,
  autoSelectedDistrict: string | null,
): string {
  return (
    selectedDistrict || autoSelectedDistrict || SELECT_VALUES.ALL_DISTRICTS
  );
}

/**
 * Renders district options in the select dropdown
 */
function renderDistrictOptions(accessibleOptions: DistrictOption[]) {
  return accessibleOptions.map(district => (
    <SelectItem key={district.value} value={district.value}>
      {district.label}
    </SelectItem>
  ));
}

/**
 * District filter component with permission-based rendering
 * Uses custom hook to separate business logic from UI concerns
 */
export function DistrictFilter({
  districts,
  selectedDistrict,
  onDistrictSelected,
  disabled = false,
  user,
  permissions,
  siteDistrictsMap,
}: DistrictFilterProps) {
  const { shouldShowFilter, accessibleOptions, autoSelectedDistrict } =
    useDistrictFilter({
      districts,
      user,
      permissions,
      siteDistrictsMap,
    });

  // Don't show the filter if user data is not available
  if (!shouldShowFilter) {
    return null;
  }

  const effectiveSelectedDistrict = getEffectiveSelectedDistrict(
    selectedDistrict,
    autoSelectedDistrict,
  );

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
        {renderDistrictOptions(accessibleOptions)}
      </SelectContent>
    </Select>
  );
}
