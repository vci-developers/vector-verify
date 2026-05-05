import { sessionSchema } from '@/api/session/validation/session-schema';
import { z } from 'zod';

const formRowSchema = z.object({
    label: z.string(),
    value: z.string(),
});

export const sessionWithFormFieldRowsSchema = z.object({
    session: sessionSchema,
    rows: z.array(formRowSchema).nullable(),
});

export type FormRow = z.infer<typeof formRowSchema>;
export type SessionWithFormFieldRows = z.infer<
    typeof sessionWithFormFieldRowsSchema
>;
