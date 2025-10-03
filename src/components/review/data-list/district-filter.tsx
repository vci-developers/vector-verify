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
import { SimplifiedDistrictDisplay } from './simplified-district-display';

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
  const {
    shouldShowFilter,
    accessibleOptions,
    shouldShowSimplified,
    singleDistrict,
  } = useDistrictFilter({
    districts,
    user,
    permissions,
    siteDistrictsMap,
  });

  // Don't show the filter if user data is not available
  if (!shouldShowFilter) {
    return null;
  }

  // Show simplified display for single district users
  if (shouldShowSimplified && singleDistrict) {
    return <SimplifiedDistrictDisplay district={singleDistrict} />;
  }

  // Show full dropdown for users with multiple accessible districts
  return (
    <Select
      value={selectedDistrict || 'all'}
      onValueChange={value =>
        onDistrictSelected(value === 'all' ? null : value)
      }
      disabled={disabled}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="All Districts" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Districts</SelectItem>
        {accessibleOptions.map(district => (
          <SelectItem key={district.value} value={district.value}>
            {district.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
