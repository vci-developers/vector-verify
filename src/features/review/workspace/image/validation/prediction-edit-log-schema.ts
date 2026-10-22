import { z } from 'zod';

export const predictionEditLogSchema = z.object({
    fields: z.object({ imageId: z.number() }),
    changes: z.object({ image: z.record(z.string(), z.unknown()) }),
});
