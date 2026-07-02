import type { z } from 'zod';
import { formSchema } from './form-schema';

export const getCurrentFormByProgramIdResponseSchema = formSchema;

export type GetCurrentFormByProgramIdResponseBody = z.infer<
    typeof getCurrentFormByProgramIdResponseSchema
>;
export type GetCurrentFormByProgramIdSuccessPayload =
    GetCurrentFormByProgramIdResponseBody;
