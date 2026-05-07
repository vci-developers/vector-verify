import type { Session } from '@/api/session/validation/session-schema';
import type { FormAnswer } from '@/api/surveillance-form/validation/form-answers-schema';
import type { SurveillanceFormData } from '@/api/surveillance-form/validation/get-surveillance-form-by-session-id-schema';

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

export function normalizeSessionRows(
    session: Session,
    formData: SurveillanceFormData | null,
): { label: string; value: string }[] {
    const sessionRows = [
        { label: 'Collector Name', value: session.collectorName },
        { label: 'Collector Title', value: session.collectorTitle },
        { label: 'Collection Method', value: session.collectionMethod },
    ];
    return formData
        ? [...sessionRows, ...normalizeFormData(formData)]
        : sessionRows;
}

export function normalizeFormData(
    data: SurveillanceFormData,
): { label: string; value: string }[] {
    if (data.kind === 'answers') {
        return data.answers.flatMap((answer: FormAnswer) =>
            answer.label !== null
                ? [{ label: answer.label, value: formatValue(answer.value) }]
                : [],
        );
    }
    return [
        {
            label: 'People in House',
            value: formatValue(data.numPeopleSleptInHouse),
        },
        { label: 'IRS Conducted', value: formatValue(data.wasIrsConducted) },
        {
            label: 'Months Since IRS',
            value: formatValue(data.monthsSinceIrs),
        },
        {
            label: 'LLINs Available',
            value: formatValue(data.numLlinsAvailable),
        },
        { label: 'LLIN Type', value: formatValue(data.llinType) },
        { label: 'LLIN Brand', value: formatValue(data.llinBrand) },
        {
            label: 'People Under LLIN',
            value: formatValue(data.numPeopleSleptUnderLlin),
        },
    ];
}
