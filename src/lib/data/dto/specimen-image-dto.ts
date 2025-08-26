import { InferenceResultDto } from "./inference-result-dto";

export type SpecimenImageDto = {
    id: number;
    url: string;
    species?: string;
    sex?: string;
    abdomenStatus?: string;
    capturedAt: number;
    submittedAt?: number;
    inferenceResult?: InferenceResultDto;
    filemd5: string;
};
