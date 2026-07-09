import { z } from 'zod';
import { booleanQueryParamSchema } from '@/lib/network/validation/boolean-query-param-schema';
import { activeMetricSnapshotSchema } from '@/api/user/validation/active-metric-snapshot-schema';

export const getUserActiveMetricsQueryParamsSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    programId: z.coerce.number().optional(),
    globalOnly: booleanQueryParamSchema().optional(),
    limit: z.coerce.number().min(1).max(365).optional(),
    offset: z.coerce.number().min(0).optional(),
});

export const getUserActiveMetricsResponseSchema = z.object({
    message: z.string(),
    metrics: z.array(activeMetricSnapshotSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
});

export type GetUserActiveMetricsQueryParams = z.infer<
    typeof getUserActiveMetricsQueryParamsSchema
>;
export type GetUserActiveMetricsResponseBody = z.infer<
    typeof getUserActiveMetricsResponseSchema
>;

export type GetUserActiveMetricsSuccessPayload =
    GetUserActiveMetricsResponseBody;
