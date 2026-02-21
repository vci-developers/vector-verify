import { z } from 'zod';

export const backendErrorSchema = z.object({
    error: z.string(),
});

export type BackendError = z.infer<typeof backendErrorSchema>;
