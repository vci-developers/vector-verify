import { z } from 'zod';
import { booleanQueryParamSchema } from '@/lib/network/validation/boolean-query-param-schema';
import { activeMetricSnapshotSchema } from '@/api/user/validation/get-user-active-metrics-schema';

export const getAllUserActiveMetricsQueryParamsSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    programId: z.coerce.number().optional(),
    globalOnly: booleanQueryParamSchema().optional(),
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
