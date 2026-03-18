import { z } from 'zod';
import { annotationTaskSchema } from '@/api/annotation-task/validation/annotation-task-schema';
import { userProfileSchema } from '@/api/user/validation/user-profile-schema';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';

export const annotationStatusSchema = z.enum([
    'PENDING',
    'ANNOTATED',
    'FLAGGED',
]);

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
    artifacts: z.string().nullable(),
    notes: z.string().nullable(),
    status: annotationStatusSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
    annotationTask: annotationTaskSchema.optional(),
    annotator: userProfileSchema.optional(),
    specimen: specimenSchema.optional(),
});

export type Annotation = z.infer<typeof annotationSchema>;
export type AnnotationStatus = z.infer<typeof annotationStatusSchema>;
