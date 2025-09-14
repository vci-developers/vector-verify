export interface UserPermissions {
    sites: {
        viewSiteMetadata: boolean;
        writeSiteMetadata: boolean;
        pushSiteMetadata: boolean;
        canAccessSiteIds: number[];
    },
    annotations: {
        viewAndWriteAnnotationTasks: boolean;
    }
}

export function canViewSites(permissions: UserPermissions): boolean {
  return permissions.sites.viewSiteMetadata;
}

export function canWriteSites(permissions: UserPermissions): boolean {
  return permissions.sites.writeSiteMetadata;
}

export function canPushSites(permissions: UserPermissions): boolean {
  return permissions.sites.pushSiteMetadata;
}

export function canAccessSite(permissions: UserPermissions, siteId: number): boolean {
  return permissions.sites.canAccessSiteIds.includes(siteId);
}

export function canViewAndWriteAnnotationTasks(permissions: UserPermissions): boolean {
  return permissions.annotations.viewAndWriteAnnotationTasks;
}