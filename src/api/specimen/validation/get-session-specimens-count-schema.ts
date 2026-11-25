import { sessionTypeSchema } from '@/api/session/validation/session-schema';
import { arrayQueryParamSchema } from '@/lib/network/validation/array-query-param-schema';
import { z } from 'zod';

export const getSessionSpecimensCountQueryParamsSchema = z.object({
    programId: z.coerce.number(),
    siteIds: arrayQueryParamSchema.optional(),
    sessionType: sessionTypeSchema.optional(),
});

export const getSessionSpecimensCountResponseSchema = z.object({
    sessions: z.array(
        z.object({
            sessionId: z.number(),
            specimenCount: z.number(),
            imageCount: z.number(),
            groups: z.array(
                z.object({
                    species: z.string().nullable(),
                    sex: z.string().nullable(),
                    abdomenStatus: z.string().nullable(),
                    count: z.number(),
                }),
            ),
        }),
    ),
});

export type GetSessionSpecimensCountQueryParams = z.infer<
    typeof getSessionSpecimensCountQueryParamsSchema
>;
export type GetSessionSpecimensCountResponseBody = z.infer<
    typeof getSessionSpecimensCountResponseSchema
>;
export type GetSessionSpecimensCountSuccessPayload =
    GetSessionSpecimensCountResponseBody;
