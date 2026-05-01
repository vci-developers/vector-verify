import { z } from 'zod';

export const arrayQueryParamSchema = z.preprocess(
    item => (typeof item === 'string' ? item.split(',') : item),
    z.array(z.union([z.string(), z.number(), z.boolean()])),
);
