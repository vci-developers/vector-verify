import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import { format } from 'date-fns';

export type MetadataFieldType = 'string' | 'number' | 'boolean';

const SESSION_DATE_FORMAT = 'MMM d, yyyy';

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
    fieldType: MetadataFieldType;
}[];

export interface MetadataRow {
    id: string;
    label: string;
    entity: 'session' | 'surveillanceForm';
    fieldName: string;
    fieldType: MetadataFieldType;
    variants: { value: unknown; displayValue: string; sessionIds: number[] }[];
}

export function formatDisplayValue(value: unknown): string {
    if (value == null) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

function buildVariants(
    fieldValueBySessionId: Map<number, unknown>,
): MetadataRow['variants'] {
    const variantByDisplayValue = new Map<
        string,
        MetadataRow['variants'][number]
    >();
    for (const [sessionId, value] of fieldValueBySessionId) {
        const displayValue = formatDisplayValue(value);
        const variant = variantByDisplayValue.get(displayValue);
        if (variant) {
            variant.sessionIds.push(sessionId);
        } else {
            variantByDisplayValue.set(displayValue, {
                value,
                displayValue,
                sessionIds: [sessionId],
            });
        }
    }
    return [...variantByDisplayValue.values()];
}

export function buildSessionLabelBySessionId(
    sessions: Session[],
): Map<number, string> {
    const countByFormattedDate = new Map<string, number>();
    for (const session of sessions) {
        const formattedDate = format(
            new Date(session.collectionDate),
            SESSION_DATE_FORMAT,
        );
        countByFormattedDate.set(
            formattedDate,
            (countByFormattedDate.get(formattedDate) ?? 0) + 1,
        );
    }

    const occurrenceByFormattedDate = new Map<string, number>();
    const sessionLabelBySessionId = new Map<number, string>();
    for (const session of sessions) {
        const formattedDate = format(
            new Date(session.collectionDate),
            SESSION_DATE_FORMAT,
        );
        const occurrence =
            (occurrenceByFormattedDate.get(formattedDate) ?? 0) + 1;
        occurrenceByFormattedDate.set(formattedDate, occurrence);
        const hasDuplicateDate =
            (countByFormattedDate.get(formattedDate) ?? 0) > 1;
        sessionLabelBySessionId.set(
            session.sessionId,
            hasDuplicateDate
                ? `${formattedDate} (${occurrence})`
                : formattedDate,
        );
    }
    return sessionLabelBySessionId;
}

export function buildMetadataRows(
    sessions: Session[],
    surveillanceFormsBySessionId: Map<number, SurveillanceForm | null>,
): MetadataRow[] {
    const sessionRows = SESSION_FIELDS.map(
        ({ fieldName, label, fieldType }) => ({
            id: `session.${fieldName}`,
            label,
            entity: 'session' as const,
            fieldName,
            fieldType,
            variants: buildVariants(
                new Map(
                    sessions.map(session => [
                        session.sessionId,
                        session[fieldName],
                    ]),
                ),
            ),
        }),
    );

    const surveillanceFormRows = SURVEILLANCE_FORM_FIELDS.map(
        ({ fieldName, label, fieldType }) => ({
            id: `surveillanceForm.${fieldName}`,
            label,
            entity: 'surveillanceForm' as const,
            fieldName,
            fieldType,
            variants: buildVariants(
                new Map(
                    sessions.map(session => [
                        session.sessionId,
                        surveillanceFormsBySessionId.get(session.sessionId)?.[
                            fieldName
                        ] ?? null,
                    ]),
                ),
            ),
        }),
    );

    return [...sessionRows, ...surveillanceFormRows];
}

export function applyConflictResolutions(
    metadataRows: MetadataRow[],
    resolutionsByMetadataRowId: Map<string, string>,
) {
    const resolvedSession: Partial<Session> = {};
    const resolvedSurveillanceForm: Partial<SurveillanceForm> = {};

    for (const metadataRow of metadataRows) {
        const chosenDisplayValue = resolutionsByMetadataRowId.get(
            metadataRow.id,
        );
        if (chosenDisplayValue === undefined) continue;

        const chosenVariant = metadataRow.variants.find(
            variant => variant.displayValue === chosenDisplayValue,
        );
        const resolvedValue = chosenVariant
            ? chosenVariant.value
            : chosenDisplayValue === 'N/A'
              ? null
              : chosenDisplayValue;

        if (metadataRow.entity === 'session') {
            Object.assign(resolvedSession, {
                [metadataRow.fieldName]: resolvedValue,
            });
        } else {
            Object.assign(resolvedSurveillanceForm, {
                [metadataRow.fieldName]: resolvedValue,
            });
        }
    }

    return { resolvedSession, resolvedSurveillanceForm };
}
