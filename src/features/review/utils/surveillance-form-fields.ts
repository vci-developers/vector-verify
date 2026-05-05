import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';

export interface SessionWithSurveillanceForm {
    session: Session;
    form: SurveillanceForm | null;
}

export interface SurveillanceFormField {
    label: string;
    fieldKey: string;
    source: 'session' | 'form';
    getValue: (session: Session, form: SurveillanceForm | null) => unknown;
    parseForPut: (fieldValue: string) => unknown;
    otherAllowed: 'string' | 'number' | false;
}

export function formatSurveillanceFormFieldValue(value: unknown): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

function sessionField(
    label: string,
    key: 'collectorName' | 'collectorTitle' | 'collectionMethod',
): SurveillanceFormField {
    return {
        label,
        fieldKey: key,
        source: 'session',
        getValue: session => session[key],
        parseForPut: fieldValue => fieldValue,
        otherAllowed: 'string',
    };
}

function surveillanceFormTextField(
    label: string,
    key: keyof SurveillanceForm,
): SurveillanceFormField {
    return {
        label,
        fieldKey: key as string,
        source: 'form',
        getValue: (_session, form) => form?.[key] ?? null,
        parseForPut: fieldValue => (fieldValue === 'N/A' ? null : fieldValue),
        otherAllowed: 'string',
    };
}

function surveillanceFormYesNoField(
    label: string,
    key: keyof SurveillanceForm,
): SurveillanceFormField {
    return {
        label,
        fieldKey: key as string,
        source: 'form',
        getValue: (_session, form) => form?.[key] ?? null,
        parseForPut: fieldValue =>
            fieldValue === 'N/A' ? undefined : fieldValue === 'Yes',
        otherAllowed: false,
    };
}

function surveillanceFormNumericField(
    label: string,
    key: keyof SurveillanceForm,
    nullable: boolean,
): SurveillanceFormField {
    return {
        label,
        fieldKey: key as string,
        source: 'form',
        getValue: (_session, form) => form?.[key] ?? null,
        parseForPut: fieldValue =>
            fieldValue === 'N/A'
                ? nullable
                    ? null
                    : undefined
                : Number(fieldValue),
        otherAllowed: 'number',
    };
}

export const SURVEILLANCE_FORM_FIELDS: SurveillanceFormField[] = [
    sessionField('Collector Name', 'collectorName'),
    sessionField('Collector Title', 'collectorTitle'),
    sessionField('Collection Method', 'collectionMethod'),
    surveillanceFormNumericField(
        'People in House',
        'numPeopleSleptInHouse',
        false,
    ),
    surveillanceFormYesNoField('IRS Conducted', 'wasIrsConducted'),
    surveillanceFormNumericField('Months Since IRS', 'monthsSinceIrs', true),
    surveillanceFormNumericField('LLINs Available', 'numLlinsAvailable', false),
    surveillanceFormTextField('LLIN Type', 'llinType'),
    surveillanceFormTextField('LLIN Brand', 'llinBrand'),
    surveillanceFormNumericField(
        'People Under LLIN',
        'numPeopleSleptUnderLlin',
        true,
    ),
];

export interface SurveillanceFormFieldConflict {
    // Each unique field value reported by at least one session, paired with its raw typed form
    reportedValues: Array<{ label: string; value: unknown }>;
    // The field value held by the majority of sessions, or null when sessions are evenly split
    majorityValue: unknown | null;
}

export type SurveillanceFormFieldConflictMap = Record<
    string,
    SurveillanceFormFieldConflict
>;

function findMajorityValue(
    distinctFieldValues: Array<{ label: string; value: unknown }>,
    sessionFieldValues: string[],
): unknown | null {
    const sessionCountByFieldValue = new Map<string, number>();
    for (const fieldValue of sessionFieldValues) {
        sessionCountByFieldValue.set(
            fieldValue,
            (sessionCountByFieldValue.get(fieldValue) ?? 0) + 1,
        );
    }

    let highestSessionCount = 0;
    for (const sessionCount of sessionCountByFieldValue.values()) {
        if (sessionCount > highestSessionCount)
            highestSessionCount = sessionCount;
    }

    const fieldValuesHeldByMostSessions = distinctFieldValues.filter(
        distinctFieldValue =>
            (sessionCountByFieldValue.get(distinctFieldValue.label) ?? 0) ===
            highestSessionCount,
    );

    return fieldValuesHeldByMostSessions.length === 1
        ? (fieldValuesHeldByMostSessions.at(0)?.value ?? null)
        : null;
}

export function findSurveillanceFormFieldConflicts(
    sessionsWithSurveillanceForms: SessionWithSurveillanceForm[],
): SurveillanceFormFieldConflictMap {
    const surveillanceFormFieldConflicts: SurveillanceFormFieldConflictMap = {};

    for (const field of SURVEILLANCE_FORM_FIELDS) {
        const sessionFieldValues = sessionsWithSurveillanceForms.map(
            ({ session, form }) =>
                formatSurveillanceFormFieldValue(field.getValue(session, form)),
        );

        if (new Set(sessionFieldValues).size <= 1) continue;

        const distinctFieldValues = [...new Set(sessionFieldValues)].map(
            fieldValue => {
                const sessionIndex = sessionFieldValues.indexOf(fieldValue);
                const sessionWithSurveillanceForm =
                    sessionsWithSurveillanceForms[sessionIndex]!;
                return {
                    label: fieldValue,
                    value: field.getValue(
                        sessionWithSurveillanceForm.session,
                        sessionWithSurveillanceForm.form,
                    ),
                };
            },
        );

        surveillanceFormFieldConflicts[field.fieldKey] = {
            reportedValues: distinctFieldValues,
            majorityValue: findMajorityValue(
                distinctFieldValues,
                sessionFieldValues,
            ),
        };
    }

    return surveillanceFormFieldConflicts;
}
