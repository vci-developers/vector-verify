export interface SurveillanceForm {
  formId: number;
  sessionId: number;
  submittedAt: number;
  numPeopleSleptInHouse: number | null;
  wasIrsConducted: boolean | null;
  monthsSinceIrs: number | null;
  numLlinsAvailable: number | null;
  llinType: string | null;
  llinBrand: string | null;
  numPeopleSleptUnderLlin: number | null;
}
