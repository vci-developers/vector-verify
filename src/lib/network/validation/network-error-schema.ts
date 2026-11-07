import { z } from 'zod';

export const networkErrorSchema = z.object({
    kind: z.enum([
        'unauthorized',
        'forbidden',
        'not_found',
        'timeout',
        'conflict',
        'rate_limited',
        'client',
        'server',
        'network',
        'unknown',
    ]),
    status: z.number().optional(),
    message: z.string().optional(),
});

export type NetworkError = z.infer<typeof networkErrorSchema>;
