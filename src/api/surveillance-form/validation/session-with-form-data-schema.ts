import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceFormData } from '@/api/surveillance-form/validation/get-surveillance-form-by-session-id-schema';

export interface SessionWithFormData {
    session: Session;
    formData: SurveillanceFormData | null;
}
