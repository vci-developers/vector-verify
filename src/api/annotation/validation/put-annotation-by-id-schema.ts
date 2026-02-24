import { z } from 'zod';
import { annotationSchema } from '@/api/annotation/validation/annotation-schema';

export const putAnnotationByIdRequestSchema = z.object({
    morphSpecies: z.string().optional(),
    morphSex: z.string().optional(),
    morphAbdomenStatus: z.string().optional(),
    visualSpecies: z.string().optional(),
    visualSex: z.string().optional(),
    visualAbdomenStatus: z.string().optional(),
    notes: z.string().optional(),
    status: z.string(),
});

export const putAnnotationByIdResponseSchema = z.object({
    message: z.string(),
    annotation: annotationSchema,
});

export type PutAnnotationByIdRequestBody = z.infer<
    typeof putAnnotationByIdRequestSchema
>;
export type PutAnnotationByIdResponseBody = z.infer<
    typeof putAnnotationByIdResponseSchema
>;

export type PutAnnotationByIdSuccessPayload = PutAnnotationByIdResponseBody;
