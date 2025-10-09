import { canAccessSite } from "../site";

export interface UserPermissions {
  sites: {
    viewSiteMetadata: boolean;
    writeSiteMetadata: boolean;
    pushSiteMetadata: boolean;
    canAccessSites: canAccessSite[];

  };
  annotations: {
    viewAndWriteAnnotationTasks: boolean;
  };
}
