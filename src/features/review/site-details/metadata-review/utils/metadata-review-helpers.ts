import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';

const SESSION_FIELDS = [
    { fieldName: 'collectorName', label: 'Collector Name' },
    { fieldName: 'collectorTitle', label: 'Collector Title' },
    { fieldName: 'collectionMethod', label: 'Collection Method' },
] as const satisfies readonly { fieldName: keyof Session; label: string }[];

const SURVEILLANCE_FORM_FIELDS = [
    { fieldName: 'numPeopleSleptInHouse', label: 'People in House' },
    { fieldName: 'wasIrsConducted', label: 'IRS Conducted' },
    { fieldName: 'monthsSinceIrs', label: 'Months Since IRS' },
    { fieldName: 'numLlinsAvailable', label: 'LLINs Available' },
    { fieldName: 'llinType', label: 'LLIN Type' },
    { fieldName: 'llinBrand', label: 'LLIN Brand' },
    { fieldName: 'numPeopleSleptUnderLlin', label: 'People Under LLIN' },
] as const satisfies readonly {
    fieldName: keyof SurveillanceForm;
    label: string;
}[];

export interface MetadataRow {
    id: string;
    label: string;
    entity: 'session' | 'surveillanceForm';
    fieldName: string;
    fieldValueBySessionId: Map<number, unknown>;
    hasConflict: boolean;
}

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
        const chosenDisplayValue = resolutionsByRowId.get(metadataRow.id);
        if (chosenDisplayValue === undefined) continue;

        const chosenValue = [
            ...metadataRow.fieldValueBySessionId.values(),
        ].find(value => formatDisplayValue(value) === chosenDisplayValue);
        if (chosenValue === undefined) continue;

        if (metadataRow.entity === 'session') {
            Object.assign(resolvedSession, {
                [metadataRow.fieldName]: chosenValue,
            });
        } else {
            Object.assign(resolvedSurveillanceForm, {
                [metadataRow.fieldName]: chosenValue,
            });
        }
    }

    return { resolvedSession, resolvedSurveillanceForm };
}
