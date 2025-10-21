import type { User, UserPermissions } from '@/features/user/types';
import type { DistrictOption } from '@/features/review/types';

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

export function getAccessibleDistricts(
  allDistricts: string[],
  user: UserWithPrivilege,
  permissions: UserPermissions,
  siteDistrictsMap?: Map<number, string>,
): string[] {
  if (canAccessMultipleDistricts(user)) {
    return allDistricts;
  }

  const accessibleDistricts = new Set<string>();

  if (permissions.sites.canAccessSites?.length) {
    permissions.sites.canAccessSites.forEach(site => {
      if (siteDistrictsMap?.has(site.siteId)) {
        const mappedDistrict = siteDistrictsMap.get(site.siteId);
        if (mappedDistrict) {
          accessibleDistricts.add(mappedDistrict);
          return;
        }
      }

      if (site.district) {
        accessibleDistricts.add(site.district);
      }
    });
  }

  if (accessibleDistricts.size > 0) {
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
