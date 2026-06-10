import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';

interface BaseMetadataRow {
    id: string;
    label: string;
    fieldValueBySessionId: Map<number, unknown>;
    hasConflict: boolean;
}

export interface SessionMetadataRow extends BaseMetadataRow {
    entity: 'session';
    fieldName: keyof Session;
}

export interface SurveillanceFormMetadataRow extends BaseMetadataRow {
    entity: 'surveillanceForm';
    fieldName: keyof SurveillanceForm;
}

export interface FormAnswerMetadataRow extends BaseMetadataRow {
    entity: 'formAnswer';
    questionId: number;
    dataType: string;
}

export interface UnitFormAnswerMetadataRow extends BaseMetadataRow {
    entity: 'unitFormAnswer';
    questionId: number;
    dataType: string;
    unitIdentity: string;
    unitLabel: string;
}

export interface UnitGroupMeta {
    unitIdentity: string;
    sessionUnitIdsBySessionId: Map<number, number>;
}

export type MetadataRow =
    | SessionMetadataRow
    | SurveillanceFormMetadataRow
    | FormAnswerMetadataRow
    | UnitFormAnswerMetadataRow;
