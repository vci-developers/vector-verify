import { PermissionsSiteResponseDto } from "../site";

export interface UserPermissions {
  sites: {
    viewSiteMetadata: boolean;
    writeSiteMetadata: boolean;
    pushSiteMetadata: boolean;
    canAccessSites: PermissionsSiteResponseDto[];

  };
  annotations: {
    viewAndWriteAnnotationTasks: boolean;
  };
}