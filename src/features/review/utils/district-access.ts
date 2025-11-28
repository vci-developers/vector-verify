import type { User, UserPermissions } from '@/features/user/types';

const PRIVILEGE_LEVELS = {
  SINGLE_DISTRICT_MAX: 1,
  MULTIPLE_DISTRICTS_MIN: 2,
} as const;

type UserWithPrivilege = Pick<User, 'privilege'>;

export function canAccessMultipleDistricts(user: UserWithPrivilege): boolean {
  return user.privilege >= PRIVILEGE_LEVELS.MULTIPLE_DISTRICTS_MIN;
}

export function getAccessibleDistricts(
  allDistricts: string[],
  user: UserWithPrivilege,
  permissions: UserPermissions,
): string[] {
  const uniqueDistricts = Array.from(new Set(allDistricts)).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );

  if (uniqueDistricts.length === 0) {
    return uniqueDistricts;
  }

  if (canAccessMultipleDistricts(user)) {
    return uniqueDistricts;
  }

  const accessibleDistricts = new Set<string>();

  permissions.sites.canAccessSites?.forEach(site => {
    if (site.district) {
      accessibleDistricts.add(site.district);
    }
  });

  if (accessibleDistricts.size === 0) {
    return uniqueDistricts;
  }

  return uniqueDistricts.filter(district => accessibleDistricts.has(district));
}

export function normalizeDistrictList(
  districts: string[] | undefined,
): string[] {
  if (!districts?.length) return [];
  return Array.from(new Set(districts.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );
}
