import { z } from 'zod';
import { activeMetricSnapshotSchema } from '@/api/user/validation/active-metric-snapshot-schema';

export const getAllUserActiveMetricsQueryParamsSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    programId: z.coerce.number(),
});

export const getAllUserActiveMetricsResponseSchema = z.object({
    message: z.string(),
    metrics: z.array(activeMetricSnapshotSchema),
});

export type GetAllUserActiveMetricsQueryParams = z.infer<
    typeof getAllUserActiveMetricsQueryParamsSchema
>;
export type GetAllUserActiveMetricsResponseBody = z.infer<
    typeof getAllUserActiveMetricsResponseSchema
>;

export type GetAllUserActiveMetricsSuccessPayload =
    GetAllUserActiveMetricsResponseBody;
