import { useMemo } from 'react';
import type { User } from '@/lib/entities/user/model';
import type { UserPermissions } from '@/lib/entities/user/permissions';
import type { DistrictOption } from '@/lib/review/types';
import {
  getAccessibleDistrictOptions,
  shouldShowDistrictFilter,
  shouldShowSimplifiedDistrictDisplay,
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
  shouldShowSimplified: boolean;
  singleDistrict?: DistrictOption;
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
    // Don't show filter if user data is not available
    if (!user || !shouldShowDistrictFilter(user)) {
      return {
        shouldShowFilter: false,
        accessibleOptions: [],
        shouldShowSimplified: false,
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

    // Determine if we should show simplified display
    const shouldShowSimplified = shouldShowSimplifiedDistrictDisplay(
      user,
      accessibleOptions,
    );

    // Get single district for simplified display
    const singleDistrict = shouldShowSimplified
      ? accessibleOptions[0]
      : undefined;

    return {
      shouldShowFilter: true,
      accessibleOptions,
      shouldShowSimplified,
      singleDistrict,
    };
  }, [districts, user, permissions, siteDistrictsMap]);
}
