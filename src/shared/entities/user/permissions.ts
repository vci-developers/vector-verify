import type { SiteDto } from '@/shared/entities/site/dto';

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
