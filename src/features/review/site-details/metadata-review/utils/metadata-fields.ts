import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';

type MetadataFieldType = 'string' | 'number' | 'boolean';

export const SESSION_FIELDS = [
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

export const SURVEILLANCE_FORM_FIELDS = [
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

const allFields = [...SESSION_FIELDS, ...SURVEILLANCE_FORM_FIELDS];

export const numberFieldNames = new Set<string>(
    allFields
        .filter(field => field.fieldType === 'number')
        .map(field => field.fieldName),
);
export const booleanFieldNames = new Set<string>(
    allFields
        .filter(field => field.fieldType === 'boolean')
        .map(field => field.fieldName),
);
