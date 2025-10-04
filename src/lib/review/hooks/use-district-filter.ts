import { useMemo } from 'react';
import type { User } from '@/lib/entities/user/model';
import type { UserPermissions } from '@/lib/entities/user/permissions';
import type { DistrictOption } from '@/lib/review/types';
import {
  getAccessibleDistrictOptions,
  shouldShowDistrictFilter,
} from '@/lib/review/permissions';

interface UseDistrictFilterProps {
  districts: DistrictOption[];
  user?: User;
  permissions?: UserPermissions;
  siteDistrictsMap?: Map<number, string>;
}

interface UseDistrictFilterReturn {
  shouldShowFilter: boolean;
  accessibleOptions: DistrictOption[];
  autoSelectedDistrict: string | null;
}

/**
 * Custom hook for managing district filter logic
 * Separates business logic from UI components following Single Responsibility Principle
 */
export function useDistrictFilter({
  districts,
  user,
  permissions,
  siteDistrictsMap,
}: UseDistrictFilterProps): UseDistrictFilterReturn {
  return useMemo(() => {
    // Early return if user data is not available
    if (!user || !shouldShowDistrictFilter(user)) {
      return {
        shouldShowFilter: false,
        accessibleOptions: [],
        autoSelectedDistrict: null,
      };
    }

    // Get accessible district options based on permissions
    const accessibleOptions = permissions
      ? getAccessibleDistrictOptions(
          districts,
          user,
          permissions,
          siteDistrictsMap,
        )
      : districts;

    // Auto-select single district for restricted users
    const autoSelectedDistrict =
      accessibleOptions.length === 1 ? accessibleOptions[0].value : null;

    return {
      shouldShowFilter: true,
      accessibleOptions,
      autoSelectedDistrict,
    };
  }, [districts, user, permissions, siteDistrictsMap]);
}
