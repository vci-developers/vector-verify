import type { SiteDto } from '@/lib/entities/site/dto';

export interface UserPermissionsDto {
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
