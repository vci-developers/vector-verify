import { siteSchema } from '@/api/site/validation/site-schema';
import { z } from 'zod';

export const userPermissionsSchema = z.object({
    sites: z.object({
        viewSiteMetadata: z.boolean(),
        writeSiteMetadata: z.boolean(),
        pushSiteMetadata: z.boolean(),
        canAccessSites: z.array(siteSchema),
    }),
    annotations: z.object({
        viewAndWriteAnnotationTasks: z.boolean(),
    }),
});

export type UserPermissions = z.infer<typeof userPermissionsSchema>;
