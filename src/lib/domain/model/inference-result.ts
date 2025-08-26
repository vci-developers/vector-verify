export type InferenceResult = {
  id: number;
  bboxTopLeftX: number;
  bboxTopLeftY: number;
  bboxWidth: number;
  bboxHeight: number;
  bboxConfidence: number;
  bboxClassId: number;
  speciesLogits?: number[];
  sexLogits?: number[];
  abdomenStatusLogits?: number[];
  speciesInferenceDuration?: number;
  sexInferenceDuration?: number;
  abdomenStatusInferenceDuration?: number;
};
