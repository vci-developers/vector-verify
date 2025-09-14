export interface UserPermissions {
  sites: {
    viewSiteMetadata: boolean;
    writeSiteMetadata: boolean;
    pushSiteMetadata: boolean;
    canAccessSiteIds: number[];
  };
  annotations: {
    viewAndWriteAnnotationTasks: boolean;
  };
}

