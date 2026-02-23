import { userProfileSchema } from '@/api/user/validation/user-profile-schema';
import { z } from 'zod';

export const annotationTaskSchema = z.object({
    id: z.number(),
    userId: z.number(),
    title: z.string(),
    description: z.string(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
    createdAt: z.number(),
    updatedAt: z.number(),
    user: userProfileSchema,
});

export type AnnotationTask = z.infer<typeof annotationTaskSchema>;
