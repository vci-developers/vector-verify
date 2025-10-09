import type { User } from '@/lib/entities/user/model';
import type { UserPermissions } from '@/lib/entities/user/permissions';
import type { DistrictOption } from '@/lib/review/types';

const PRIVILEGE_LEVELS = {
  SINGLE_DISTRICT_MAX: 1,
  MULTIPLE_DISTRICTS_MIN: 2,
} as const;

type UserWithPrivilege = Pick<User, 'privilege'>;

export function canAccessMultipleDistricts(user: UserWithPrivilege): boolean {
  return user.privilege >= PRIVILEGE_LEVELS.MULTIPLE_DISTRICTS_MIN;
}

export function isRestrictedToSingleDistrict(user: UserWithPrivilege): boolean {
  return user.privilege <= PRIVILEGE_LEVELS.SINGLE_DISTRICT_MAX;
}

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

export function getAccessibleDistricts(
  allDistricts: string[],
  user: UserWithPrivilege,
  permissions: UserPermissions,
  siteDistrictsMap?: Map<number, string>,
): string[] {
  if (canAccessMultipleDistricts(user)) {
    return allDistricts;
  }

  const hasSiteAccess =
    siteDistrictsMap && permissions.sites.canAccessSiteIds.length > 0;
  if (hasSiteAccess) {
    const accessibleDistricts = extractDistrictsFromSites(
      permissions.sites.canAccessSiteIds,
      siteDistrictsMap,
    );
    return Array.from(accessibleDistricts);
  }

  return allDistricts;
}

export function shouldShowDistrictFilter(user: UserWithPrivilege): boolean {
  return true;
}

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
