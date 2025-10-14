import { SiteDto } from "../site";

export interface UserPermissions {
  sites: {
    viewSiteMetadata: boolean;
    writeSiteMetadata: boolean;
    pushSiteMetadata: boolean;
    canAccessSites: SiteDto[];

  };
  annotations: {
    viewAndWriteAnnotationTasks: boolean;
  };
}