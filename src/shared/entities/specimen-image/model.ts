export interface SpecimenImage {
  id: number;
  url: string;
  species: string | null;
  sex: string | null;
  abdomenStatus: string | null;
  capturedAt: number | null;
  submittedAt: number;
  inferenceResult: string | null;
  filemd5: string;
}
