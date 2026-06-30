import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';

export const NOT_APPLICABLE = 'N/A';
export const BOOLEAN_TRUE_DISPLAY = 'Yes';
export const BOOLEAN_FALSE_DISPLAY = 'No';

type MetadataFieldType = 'string' | 'number' | 'boolean';

const SESSION_FIELDS = [
    {
        fieldName: 'collectorName',
        label: 'Collector Name',
        fieldType: 'string',
    },
    {
        fieldName: 'collectorTitle',
        label: 'Collector Title',
        fieldType: 'string',
    },
    {
        fieldName: 'collectionMethod',
        label: 'Collection Method',
        fieldType: 'string',
    },
] as const satisfies readonly {
    fieldName: keyof Session;
    label: string;
    fieldType: MetadataFieldType;
}[];

const SURVEILLANCE_FORM_FIELDS = [
    {
        fieldName: 'numPeopleSleptInHouse',
        label: 'People in House',
        fieldType: 'number',
    },
    {
        fieldName: 'wasIrsConducted',
        label: 'Was IRS Conducted',
        fieldType: 'boolean',
    },
    {
        fieldName: 'monthsSinceIrs',
        label: 'Months Since IRS',
        fieldType: 'number',
    },
    {
        fieldName: 'numLlinsAvailable',
        label: 'LLINs Available',
        fieldType: 'number',
    },
    { fieldName: 'llinType', label: 'LLIN Type', fieldType: 'string' },
    { fieldName: 'llinBrand', label: 'LLIN Brand', fieldType: 'string' },
    {
        fieldName: 'numPeopleSleptUnderLlin',
        label: 'People Under LLIN',
        fieldType: 'number',
    },
] as const satisfies readonly {
    fieldName: keyof SurveillanceForm;
    label: string;
    fieldType: MetadataFieldType;
}[];

export interface MetadataRow {
    id: string;
    label: string;
    entity: 'session' | 'surveillanceForm';
    fieldName: string;
    fieldType: MetadataFieldType;
    fieldValueBySessionId: Map<number, unknown>;
    hasConflict: boolean;
}

export function formatDisplayValue(value: unknown): string {
    if (value == null) return NOT_APPLICABLE;
    if (typeof value === 'boolean')
        return value ? BOOLEAN_TRUE_DISPLAY : BOOLEAN_FALSE_DISPLAY;
    return String(value);
}

export function buildMetadataRows(
    sessions: Session[],
    surveillanceFormBySessionId: Map<number, SurveillanceForm | null>,
): MetadataRow[] {
    const metadataRows: MetadataRow[] = SESSION_FIELDS.map(
        ({ fieldName, label, fieldType }) =>
            buildMetadataRow(
                'session',
                fieldName,
                label,
                fieldType,
                new Map(
                    sessions.map(session => [
                        session.sessionId,
                        session[fieldName],
                    ]),
                ),
            ),
    );

    const hasAnySurveillanceForm = [
        ...surveillanceFormBySessionId.values(),
    ].some(surveillanceForm => surveillanceForm !== null);
    if (!hasAnySurveillanceForm) return metadataRows;

    for (const { fieldName, label, fieldType } of SURVEILLANCE_FORM_FIELDS) {
        metadataRows.push(
            buildMetadataRow(
                'surveillanceForm',
                fieldName,
                label,
                fieldType,
                new Map(
                    sessions.map(session => [
                        session.sessionId,
                        surveillanceFormBySessionId.get(session.sessionId)?.[
                            fieldName
                        ] ?? null,
                    ]),
                ),
            ),
        );
    }

    return metadataRows;
}

function buildMetadataRow(
    entity: MetadataRow['entity'],
    fieldName: string,
    label: string,
    fieldType: MetadataFieldType,
    fieldValueBySessionId: Map<number, unknown>,
): MetadataRow {
    const distinctDisplayValues = new Set(
        [...fieldValueBySessionId.values()].map(formatDisplayValue),
    );
    return {
        id: `${entity}.${fieldName}`,
        label,
        entity,
        fieldName,
        fieldType,
        fieldValueBySessionId,
        hasConflict: distinctDisplayValues.size > 1,
    };
}
