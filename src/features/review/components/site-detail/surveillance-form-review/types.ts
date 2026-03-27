import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';

export interface SessionWithForm {
    session: Session;
    form: SurveillanceForm | null;
}
