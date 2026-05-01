import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';

export interface SessionWithForm {
    session: Session;
    form: SurveillanceForm | null;
}

export interface DataField {
    label: string;
    fieldKey: string;
    source: 'session' | 'form';
    getValue: (session: Session, form: SurveillanceForm | null) => unknown;
    parseForPut: (displayValue: string) => unknown;
    otherAllowed: 'string' | 'number' | false;
}

export function formatFieldValue(value: unknown): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

function sessionTextField(
    label: string,
    key: 'collectorName' | 'collectorTitle' | 'collectionMethod',
): DataField {
    return {
        label,
        fieldKey: key,
        source: 'session',
        getValue: session => session[key],
        parseForPut: v => v,
        otherAllowed: 'string',
    };
}

function surveyFormTextField(
    label: string,
    key: keyof SurveillanceForm,
): DataField {
    return {
        label,
        fieldKey: key as string,
        source: 'form',
        getValue: (_, form) => form?.[key] ?? null,
        parseForPut: v => (v === 'N/A' ? null : v),
        otherAllowed: 'string',
    };
}

function surveyFormYesNoField(
    label: string,
    key: keyof SurveillanceForm,
): DataField {
    return {
        label,
        fieldKey: key as string,
        source: 'form',
        getValue: (_, form) => form?.[key] ?? null,
        parseForPut: v => (v === 'N/A' ? undefined : v === 'Yes'),
        otherAllowed: false,
    };
}

function surveyFormNumericField(
    label: string,
    key: keyof SurveillanceForm,
    nullable: boolean,
): DataField {
    return {
        label,
        fieldKey: key as string,
        source: 'form',
        getValue: (_, form) => form?.[key] ?? null,
        parseForPut: v =>
            v === 'N/A' ? (nullable ? null : undefined) : Number(v),
        otherAllowed: 'number',
    };
}

export const DATA_FIELDS: DataField[] = [
    sessionTextField('Collector Name', 'collectorName'),
    sessionTextField('Collector Title', 'collectorTitle'),
    sessionTextField('Collection Method', 'collectionMethod'),
    surveyFormNumericField('People in House', 'numPeopleSleptInHouse', false),
    surveyFormYesNoField('IRS Conducted', 'wasIrsConducted'),
    surveyFormNumericField('Months Since IRS', 'monthsSinceIrs', true),
    surveyFormNumericField('LLINs Available', 'numLlinsAvailable', false),
    surveyFormTextField('LLIN Type', 'llinType'),
    surveyFormTextField('LLIN Brand', 'llinBrand'),
    surveyFormNumericField(
        'People Under LLIN',
        'numPeopleSleptUnderLlin',
        true,
    ),
];

export interface FieldConflict {
    // Unique values reported across sessions, as display-label + raw typed value pairs
    reportedValues: Array<{ label: string; value: unknown }>;
    // The value reported by the majority of sessions, or null if sessions are evenly split
    majorityValue: unknown | null;
}

export type ConflictMap = Record<string, FieldConflict>;

function findMajorityValue(
    reportedValues: Array<{ label: string; value: unknown }>,
    allSessionLabels: string[],
): unknown | null {
    const sessionCountPerLabel = new Map<string, number>();
    for (const label of allSessionLabels) {
        sessionCountPerLabel.set(
            label,
            (sessionCountPerLabel.get(label) ?? 0) + 1,
        );
    }

    let highestSessionCount = 0;
    for (const count of sessionCountPerLabel.values()) {
        if (count > highestSessionCount) highestSessionCount = count;
    }

    const valuesHeldByMostSessions = reportedValues.filter(
        v => (sessionCountPerLabel.get(v.label) ?? 0) === highestSessionCount,
    );

    return valuesHeldByMostSessions.length === 1
        ? (valuesHeldByMostSessions.at(0)?.value ?? null)
        : null;
}

export function computeConflicts(forms: SessionWithForm[]): ConflictMap {
    const conflicts: ConflictMap = {};

    for (const field of DATA_FIELDS) {
        const allSessionLabels = forms.map(({ session, form }) =>
            formatFieldValue(field.getValue(session, form)),
        );

        if (new Set(allSessionLabels).size <= 1) continue;

        const seen = new Set<string>();
        const reportedValues: Array<{ label: string; value: unknown }> = [];
        for (const [i, sessionWithForm] of forms.entries()) {
            const label = allSessionLabels[i];
            if (label === undefined) continue;
            if (!seen.has(label)) {
                seen.add(label);
                reportedValues.push({
                    label,
                    value: field.getValue(
                        sessionWithForm.session,
                        sessionWithForm.form,
                    ),
                });
            }
        }

        conflicts[field.fieldKey] = {
            reportedValues,
            majorityValue: findMajorityValue(reportedValues, allSessionLabels),
        };
    }

    return conflicts;
}
