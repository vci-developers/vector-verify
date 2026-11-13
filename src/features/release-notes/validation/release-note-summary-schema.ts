import { z } from 'zod';

export const releaseNoteSummarySchema = z.object({
    id: z.string(),
    date: z.string(),
    title: z.string(),
    changes: z.array(
        z.object({
            id: z.string(),
            title: z.string(),
            summary: z.string(),
        }),
    ),
});

export type ReleaseNoteSummary = z.infer<typeof releaseNoteSummarySchema>;
