import { z } from 'zod';
import {
    annotationTaskSchema,
    annotationTaskStatusSchema,
} from '@/api/annotation-task/validation/annotation-task-schema';

export const getAnnotationTasksQueryParamsSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    title: z.string().optional(),
    status: annotationTaskStatusSchema.optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
});

export const getAnnotationTasksResponseSchema = z.object({
    tasks: z.array(annotationTaskSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
});

export type GetAnnotationTasksQueryParams = z.infer<
    typeof getAnnotationTasksQueryParamsSchema
>;
export type GetAnnotationTasksResponseBody = z.infer<
    typeof getAnnotationTasksResponseSchema
>;

export type GetAnnotationTasksSuccessPayload = GetAnnotationTasksResponseBody;
