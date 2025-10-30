import type { SurveillanceFormDto } from './dto';
import type { SurveillanceForm } from './model';

export function mapSurveillanceFormDtoToModel(
  dto: SurveillanceFormDto,
): SurveillanceForm {
  return {
    formId: dto.formId,
    sessionId: dto.sessionId,
    submittedAt: dto.submittedAt,
    numPeopleSleptInHouse: dto.numPeopleSleptInHouse,
    wasIrsConducted: dto.wasIrsConducted,
    monthsSinceIrs: dto.monthsSinceIrs,
    numLlinsAvailable: dto.numLlinsAvailable,
    llinType: dto.llinType,
    llinBrand: dto.llinBrand,
    numPeopleSleptUnderLlin: dto.numPeopleSleptUnderLlin,
  };
}
