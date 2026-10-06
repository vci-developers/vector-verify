import type { z } from 'zod';
import { formSchema } from './form-schema';

export const getFormByVersionResponseSchema = formSchema;

export type GetFormByVersionResponseBody = z.infer<
    typeof getFormByVersionResponseSchema
>;
export type GetFormByVersionSuccessPayload = GetFormByVersionResponseBody;
