import type { User } from '@/lib/entities/user/model';
import type { UserPermissions } from '@/lib/entities/user/permissions';
import type { DistrictOption } from '@/lib/review/types';

/**
 * Review-specific permission utilities for district access control
 * This module handles the business logic for district filtering in the review context
 */

// Constants for privilege levels
const PRIVILEGE_LEVELS = {
  SINGLE_DISTRICT_MAX: 1,
  MULTIPLE_DISTRICTS_MIN: 2,
} as const;

// Type for user with privilege information
type UserWithPrivilege = Pick<User, 'privilege'>;

/**
 * Determines if a user can access multiple districts based on their privilege level
 * @param user - User object containing privilege information
 * @returns true if user can access multiple districts (privilege 2+), false otherwise
 */
export function canAccessMultipleDistricts(user: UserWithPrivilege): boolean {
  return user.privilege >= PRIVILEGE_LEVELS.MULTIPLE_DISTRICTS_MIN;
}

/**
 * Determines if a user is restricted to a single district based on their privilege level
 * @param user - User object containing privilege information
 * @returns true if user is restricted to single district (privilege 0 or 1), false otherwise
 */
export function isRestrictedToSingleDistrict(user: UserWithPrivilege): boolean {
  return user.privilege <= PRIVILEGE_LEVELS.SINGLE_DISTRICT_MAX;
}

/**
 * Extracts unique districts from user's accessible sites
 * @param siteIds - Array of site IDs the user can access
 * @param siteDistrictsMap - Mapping of site IDs to districts
 * @returns Set of unique districts from accessible sites
 */
function extractDistrictsFromSites(
  siteIds: number[],
  siteDistrictsMap: Map<number, string>,
): Set<string> {
  const accessibleDistricts = new Set<string>();

  siteIds.forEach(siteId => {
    const district = siteDistrictsMap.get(siteId);
    if (district) {
      accessibleDistricts.add(district);
    }
  });

  return accessibleDistricts;
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
  user: UserWithPrivilege,
  permissions: UserPermissions,
  siteDistrictsMap?: Map<number, string>,
): string[] {
  // Privilege 2 users can access all districts
  if (canAccessMultipleDistricts(user)) {
    return allDistricts;
  }

  // For restricted users, filter based on their accessible sites
  const hasSiteAccess =
    siteDistrictsMap && permissions.sites.canAccessSiteIds.length > 0;
  if (hasSiteAccess) {
    const accessibleDistricts = extractDistrictsFromSites(
      permissions.sites.canAccessSiteIds,
      siteDistrictsMap,
    );
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
export function shouldShowDistrictFilter(user: UserWithPrivilege): boolean {
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
  user: UserWithPrivilege,
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
