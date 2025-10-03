import type { User } from '@/lib/entities/user/model';
import type { UserPermissions } from '@/lib/entities/user/permissions';
import type { DistrictOption } from '@/lib/review/types';

/**
 * Review-specific permission utilities for district access control
 * This module handles the business logic for district filtering in the review context
 */

/**
 * Determines if a user can access multiple districts based on their privilege level
 * @param user - User object containing privilege information
 * @returns true if user can access multiple districts (privilege 2), false otherwise
 */
export function canAccessMultipleDistricts(user: {
  privilege: number;
}): boolean {
  return user.privilege >= 2;
}

/**
 * Determines if a user is restricted to a single district based on their privilege level
 * @param user - User object containing privilege information
 * @returns true if user is restricted to single district (privilege 0 or 1), false otherwise
 */
export function isRestrictedToSingleDistrict(user: {
  privilege: number;
}): boolean {
  return user.privilege < 2;
}

/**
 * Filters available districts based on user permissions and privilege level
 * @param allDistricts - Array of all available districts
 * @param user - User object containing privilege information
 * @param permissions - User permissions containing site access information
 * @param siteDistrictsMap - Optional mapping of site IDs to districts for more precise filtering
 * @returns Filtered array of districts the user can access
 */
export function getAccessibleDistricts(
  allDistricts: string[],
  user: { privilege: number },
  permissions: UserPermissions,
  siteDistrictsMap?: Map<number, string>,
): string[] {
  // Privilege 2 users can access all districts
  if (canAccessMultipleDistricts(user)) {
    return allDistricts;
  }

  // For privilege 0/1 users, filter based on their accessible sites
  if (siteDistrictsMap && permissions.sites.canAccessSiteIds.length > 0) {
    const accessibleDistricts = new Set<string>();

    // Get unique districts from accessible sites
    permissions.sites.canAccessSiteIds.forEach(siteId => {
      const district = siteDistrictsMap.get(siteId);
      if (district) {
        accessibleDistricts.add(district);
      }
    });

    return Array.from(accessibleDistricts);
  }

  // Fallback: return all districts if we can't determine specific access
  // The API should handle the actual filtering based on user permissions
  return allDistricts;
}

/**
 * Determines if the district filter should be shown to the user
 * @param user - User object containing privilege information
 * @returns true if district filter should be shown, false otherwise
 */
export function shouldShowDistrictFilter(user: { privilege: number }): boolean {
  // All users can see the district filter, but the options will be filtered
  return true;
}

/**
 * Filters district options based on user permissions
 * @param districts - Array of district options
 * @param user - User object containing privilege information
 * @param permissions - User permissions containing site access information
 * @param siteDistrictsMap - Optional mapping of site IDs to districts
 * @returns Filtered array of district options the user can access
 */
export function getAccessibleDistrictOptions(
  districts: DistrictOption[],
  user: { privilege: number },
  permissions: UserPermissions,
  siteDistrictsMap?: Map<number, string>,
): DistrictOption[] {
  const allDistrictNames = districts.map(d => d.value);
  const accessibleDistricts = getAccessibleDistricts(
    allDistrictNames,
    user,
    permissions,
    siteDistrictsMap,
  );

  return districts.filter(district =>
    accessibleDistricts.includes(district.value),
  );
}

/**
 * Determines if a user should see a simplified district display instead of a dropdown
 * @param user - User object containing privilege information
 * @param accessibleOptions - Array of accessible district options
 * @returns true if user should see simplified display, false otherwise
 */
export function shouldShowSimplifiedDistrictDisplay(
  user: { privilege: number },
  accessibleOptions: DistrictOption[],
): boolean {
  return isRestrictedToSingleDistrict(user) && accessibleOptions.length === 1;
}
