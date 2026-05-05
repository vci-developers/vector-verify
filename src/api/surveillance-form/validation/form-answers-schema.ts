import { z } from 'zod';

const formAnswerSchema = z.object({
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
    submittedAt: z.number().nullable(),
    createdAt: z.number().nullable(),
    updatedAt: z.number().nullable(),
});

export const formAnswersSchema = z.object({
    formId: z.number(),
    formName: z.string(),
    formVersion: z.string(),
    programId: z.number(),
    sessionId: z.number(),
    answers: z.array(formAnswerSchema),
});

export type FormAnswers = z.infer<typeof formAnswersSchema>;
export type FormAnswer = z.infer<typeof formAnswerSchema>;
