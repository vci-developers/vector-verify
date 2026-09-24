import type { GetUserAuthEventsQueryParams } from '@/api/user/validation/get-user-auth-events-schema';

export const userKeys = {
    permissions: () => ['user', 'permissions'] as const,
    profile: () => ['user', 'profile'] as const,
    authEvents: (queryParams: GetUserAuthEventsQueryParams) =>
        ['user', 'auth-events', queryParams] as const,
};
