import type { UserPermissions } from '@/lib/entities/user/permissions';

export function canViewSites(permissions: UserPermissions): boolean {
  return permissions.sites.viewSiteMetadata;
}

export function canWriteSites(permissions: UserPermissions): boolean {
  return permissions.sites.writeSiteMetadata;
}

export function canPushSites(permissions: UserPermissions): boolean {
  return permissions.sites.pushSiteMetadata;
}

export function canAccessSite(
  permissions: UserPermissions,
  siteId: number,
): boolean {
  return permissions.sites.canAccessSites.some(site => site.siteId === siteId);
}

export function canViewAndWriteAnnotationTasks(
  permissions: UserPermissions,
): boolean {
  return permissions.annotations.viewAndWriteAnnotationTasks;
}
