import { z } from 'zod';

export const formAnswerSchema = z.object({
    id: z.number(),
    frontendId: z.string().nullable(),
    questionId: z.number(),
    parentId: z.number().nullable(),
    prerequisite: z.unknown(),
    label: z.string().nullable(),
    type: z.string().nullable(),
    required: z.boolean().nullable(),
    options: z.array(z.unknown()).nullable(),
    value: z.string(),
    dataType: z.string(),
    answerScope: z.string().nullable(),
    submittedAt: z.number().nullable(),
    createdAt: z.number().nullable(),
    updatedAt: z.number().nullable(),
});

export type FormAnswer = z.infer<typeof formAnswerSchema>;
