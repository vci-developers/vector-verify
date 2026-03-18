import { userProfileSchema } from '@/api/user/validation/user-profile-schema';
import { z } from 'zod';

export const annotationTaskStatusSchema = z.enum([
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
]);

export const annotationTaskSchema = z.object({
    id: z.number(),
    annotatorId: z.number().optional(),
    title: z.string(),
    description: z.string(),
    status: annotationTaskStatusSchema,
    annotationCounts: z
        .object({
            total: z.number(),
            pending: z.number(),
            annotated: z.number(),
            flagged: z.number(),
        })
        .optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
    annotator: userProfileSchema.optional(),
});

export type AnnotationTask = z.infer<typeof annotationTaskSchema>;
export type AnnotationTaskStatus = z.infer<typeof annotationTaskStatusSchema>;
