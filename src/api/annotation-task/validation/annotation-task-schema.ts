import { userProfileSchema } from '@/api/user/validation/user-profile-schema';
import { z } from 'zod';

export const annotationTaskStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);

export const annotationTaskSchema = z.object({
    id: z.number(),
    annotatorId: z.number(),
    title: z.string(),
    description: z.string(),
    status: annotationTaskStatusSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
    annotator: userProfileSchema,
});

export type AnnotationTask = z.infer<typeof annotationTaskSchema>;
export type AnnotationTaskStatus = z.infer<typeof annotationTaskStatusSchema>;
