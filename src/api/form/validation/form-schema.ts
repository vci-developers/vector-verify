import { formQuestionSchema } from '@/api/form-question/validation/form-question-schema';
import { z } from 'zod';

export const formSchema = z.object({
    id: z.number(),
    programId: z.number(),
    name: z.string(),
    version: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
    questions: z.array(formQuestionSchema).optional(),
});

export type Form = z.infer<typeof formSchema>;
