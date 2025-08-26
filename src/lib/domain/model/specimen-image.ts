import { InferenceResult } from "./inference-result";

export type SpecimenImage = {
    id: number;
    url: string;
    species?: string;
    sex?: string;
    abdomenStatus?: string;
    capturedAt: number;
    submittedAt?: number;
    inferenceResult?: InferenceResult;
    filemd5: string;
};
