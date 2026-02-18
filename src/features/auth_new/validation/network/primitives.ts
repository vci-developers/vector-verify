import { z } from 'zod';

const baseAuthUserFields = {
    id: z.number(),
    email: z.email(),
    privilege: z.number(),
    isActive: z.boolean(),
};

export const authTokensSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});

export const baseAuthUserSchema = z.object(baseAuthUserFields);

export const authUserWithProgramSchema = baseAuthUserSchema.extend({
    programId: z.number(),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;
export type BaseAuthUser = z.infer<typeof baseAuthUserSchema>;
export type AuthUserWithProgram = z.infer<typeof authUserWithProgramSchema>;
