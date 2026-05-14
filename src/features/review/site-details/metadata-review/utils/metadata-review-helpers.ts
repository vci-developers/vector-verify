import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';

type MetaDataFieldType = 'string' | 'number' | 'boolean';

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
    fieldType: MetaDataFieldType;
}[];

const SURVEILLANCE_FORM_FIELDS = [
    {
        fieldName: 'numPeopleSleptInHouse',
        label: 'People in House',
        fieldType: 'number',
    },
    {
        fieldName: 'wasIrsConducted',
        label: 'IRS Conducted',
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
    {
        fieldName: 'llinType',
        label: 'LLIN Type',
        fieldType: 'string',
    },
    {
        fieldName: 'llinBrand',
        label: 'LLIN Brand',
        fieldType: 'string',
    },
    {
        fieldName: 'numPeopleSleptUnderLlin',
        label: 'People Under LLIN',
        fieldType: 'number',
    },
] as const satisfies readonly {
    fieldName: keyof SurveillanceForm;
    label: string;
    fieldType: MetaDataFieldType;
}[];

export interface MetadataRow {
    id: string;
    label: string;
    entity: 'session' | 'surveillanceForm';
    fieldName: string;
    fieldValueBySessionId: Map<number, unknown>;
    hasConflict: boolean;
}

const allFields = [...SESSION_FIELDS, ...SURVEILLANCE_FORM_FIELDS];
export const fieldTypeByFieldName = new Map<string, MetaDataFieldType>(
    allFields.map(field => [field.fieldName, field.fieldType]),
);

export function formatDisplayValue(value: unknown): string {
    if (value == null) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

export function buildMetadataRows(
    sessions: Session[],
    surveillanceFormsBySessionId: Map<number, SurveillanceForm | null>,
): MetadataRow[] {
    const metadataRows: MetadataRow[] = [];

    for (const { fieldName, label } of SESSION_FIELDS) {
        const fieldValueBySessionId = new Map(
            sessions.map(session => [session.sessionId, session[fieldName]]),
        );
        const hasConflict =
            new Set([...fieldValueBySessionId.values()].map(formatDisplayValue))
                .size > 1;
        metadataRows.push({
            id: `session.${fieldName}`,
            label,
            entity: 'session',
            fieldName,
            fieldValueBySessionId,
            hasConflict,
        });
    }

    const hasAnySurveillanceForm = [
        ...surveillanceFormsBySessionId.values(),
    ].some(form => form !== null);
    if (!hasAnySurveillanceForm) return metadataRows;

    for (const { fieldName, label } of SURVEILLANCE_FORM_FIELDS) {
        const fieldValueBySessionId = new Map(
            sessions.map(session => [
                session.sessionId,
                surveillanceFormsBySessionId.get(session.sessionId)?.[
                    fieldName
                ] ?? null,
            ]),
        );
        const hasConflict =
            new Set([...fieldValueBySessionId.values()].map(formatDisplayValue))
                .size > 1;
        metadataRows.push({
            id: `surveillanceForm.${fieldName}`,
            label,
            entity: 'surveillanceForm',
            fieldName,
            fieldValueBySessionId,
            hasConflict,
        });
    }

    return metadataRows;
}

export function applyConflictResolutions(
    metadataRows: MetadataRow[],
    resolutionsByRowId: Map<string, string>,
) {
    const resolvedSession: Partial<Session> = {};
    const resolvedSurveillanceForm: Partial<SurveillanceForm> = {};

    for (const metadataRow of metadataRows) {
        const selectedFieldDisplay = resolutionsByRowId.get(metadataRow.id);
        if (selectedFieldDisplay === undefined) continue;

        const existingSessionFieldValue = [
            ...metadataRow.fieldValueBySessionId.values(),
        ].find(value => formatDisplayValue(value) === selectedFieldDisplay);

        let resolvedFieldValue: unknown;
        if (existingSessionFieldValue !== undefined) {
            resolvedFieldValue = existingSessionFieldValue;
        } else if (selectedFieldDisplay === 'N/A') {
            resolvedFieldValue = null;
        } else if (
            fieldTypeByFieldName.get(metadataRow.fieldName) === 'number'
        ) {
            resolvedFieldValue = parseInt(selectedFieldDisplay, 10);
        } else {
            resolvedFieldValue = selectedFieldDisplay;
        }

        if (metadataRow.entity === 'session') {
            Object.assign(resolvedSession, {
                [metadataRow.fieldName]: resolvedFieldValue,
            });
        } else {
            Object.assign(resolvedSurveillanceForm, {
                [metadataRow.fieldName]: resolvedFieldValue,
            });
        }
    }

    return { resolvedSession, resolvedSurveillanceForm };
}
