import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';

export type FieldValue = string | number | boolean | null;

export interface SessionWithSurveillanceForm {
    session: Session;
    form: SurveillanceForm | null;
}

export interface SurveillanceFormField {
    label: string;
    fieldKey: string;
    source: 'session' | 'form';
    getValue: (session: Session, form: SurveillanceForm | null) => FieldValue;
    deserializeApiValue: (fieldValue: string) => FieldValue | undefined;
    otherAllowed: 'string' | 'number' | false;
}

export function formatSurveillanceFormFieldValue(
    value: FieldValue | undefined,
): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

function normalizeValue(value: FieldValue | undefined): FieldValue {
    return value === undefined || value === null ? null : value;
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
        deserializeApiValue: fieldValue => fieldValue,
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
        deserializeApiValue: fieldValue =>
            fieldValue === 'N/A' ? null : fieldValue,
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
        deserializeApiValue: fieldValue =>
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
        deserializeApiValue: fieldValue =>
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
    reportedValues: string[];
    majorityLabel: string | null;
}

export type FieldConflictMap = Record<string, SurveillanceFormFieldConflict>;

function findMajorityLabel(sessionValues: FieldValue[]): string | null {
    const countByValue = new Map<FieldValue, number>();
    for (const v of sessionValues) {
        countByValue.set(v, (countByValue.get(v) ?? 0) + 1);
    }

    let highestCount = 0;
    for (const count of countByValue.values()) {
        if (count > highestCount) highestCount = count;
    }

    const withHighestCount = [...countByValue.keys()].filter(
        v => (countByValue.get(v) ?? 0) === highestCount,
    );

    return withHighestCount.length === 1
        ? formatSurveillanceFormFieldValue(withHighestCount[0] ?? null)
        : null;
}

export function findSurveillanceFormFieldConflicts(
    sessionsWithForms: SessionWithSurveillanceForm[],
): FieldConflictMap {
    const fieldConflicts: FieldConflictMap = {};

    for (const field of SURVEILLANCE_FORM_FIELDS) {
        const sessionValues = sessionsWithForms.map(({ session, form }) =>
            normalizeValue(field.getValue(session, form)),
        );

        if (new Set(sessionValues).size <= 1) continue;

        const distinctValues = [...new Set(sessionValues)];

        fieldConflicts[field.fieldKey] = {
            reportedValues: distinctValues.map(
                formatSurveillanceFormFieldValue,
            ),
            majorityLabel: findMajorityLabel(sessionValues),
        };
    }

    return fieldConflicts;
}
