import { z } from 'zod';
import { annotationTaskSchema } from '@/api/annotation-task/validation/annotation-task-schema';
import { userProfileSchema } from '@/api/user/validation/user-profile-schema';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';

export const annotationSchema = z.object({
    id: z.number(),
    annotationTaskId: z.number(),
    annotatorId: z.number(),
    specimenId: z.number(),
    morphSpecies: z.string().nullable(),
    morphSex: z.string().nullable(),
    morphAbdomenStatus: z.string().nullable(),
    visualSpecies: z.string().nullable(),
    visualSex: z.string().nullable(),
    visualAbdomenStatus: z.string().nullable(),
    notes: z.string().nullable(),
    status: z.enum(['PENDING', 'ANNOTATED', 'FLAGGED']),
    createdAt: z.number(),
    updatedAt: z.number(),
    annotationTask: annotationTaskSchema,
    annotator: userProfileSchema,
    specimen: specimenSchema,
});

export type Annotation = z.infer<typeof annotationSchema>;
