import { z } from 'zod';
import { annotationTaskSchema } from '@/api/annotation-task/validation/annotation-task-schema';

export const getAnnotationTasksQueryParamsSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    title: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
});

export const getAnnotationTasksSchema = z.object({
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
    typeof getAnnotationTasksSchema
>;

export type GetAnnotationTasksSuccessPayload = GetAnnotationTasksResponseBody;