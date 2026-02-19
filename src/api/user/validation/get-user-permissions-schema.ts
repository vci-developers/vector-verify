import { z } from 'zod';
import { userPermissionsSchema } from '@/api/user/validation/user-permissions-schema';

export const getUserPermissionsSchema = z.object({
    message: z.string(),
    programId: z.number(),
    permissions: userPermissionsSchema,
});

export type GetUserPermissionsResponseBody = z.infer<typeof getUserPermissionsSchema>;

export type GetUserPermissionsSuccessPayload = GetUserPermissionsResponseBody;
