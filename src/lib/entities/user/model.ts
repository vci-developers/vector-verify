import type { SiteDto } from '@/lib/entities/site/dto';

export interface User {
  id: number;
  email: string;
  privilege: number;
  isActive: boolean;
  isWhitelisted: boolean;
}

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
