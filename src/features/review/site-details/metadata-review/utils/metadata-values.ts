import { numberFieldNames } from '@/features/review/site-details/metadata-review/utils/metadata-fields';
import type { MetadataRow } from '@/features/review/site-details/metadata-review/utils/metadata-row-types';

type RowValidator = (value: string) => string | null;

export function formatDisplayValue(value: unknown): string {
    if (value == null) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

export function parseFormAnswerValue(
    displayString: string,
    dataType: string,
): unknown {
    if (displayString === 'N/A') return null;
    if (dataType === 'boolean') {
        if (displayString === 'Yes') return true;
        if (displayString === 'No') return false;
    }
    if (dataType === 'number') return Number(displayString);
    return displayString;
}

export function validateWholePositiveInteger(value: string): string | null {
    if (value === 'N/A') return null;
    if (!/^\d+$/.test(value) || parseInt(value, 10) < 1) {
        return 'Must be a whole positive integer';
    }
    return null;
}

export function validateWholeNonNegativeInteger(value: string): string | null {
    if (value === 'N/A') return null;
    if (!/^\d+$/.test(value)) {
        return 'Must be a whole non-negative integer';
    }
    return null;
}

export function getValidatorForRow(row: MetadataRow): RowValidator | undefined {
    if (row.entity === 'formAnswer' || row.entity === 'unitFormAnswer') {
        return row.dataType === 'number'
            ? validateWholePositiveInteger
            : undefined;
    }
    if (row.fieldName === 'numLlinsAvailable') {
        return validateWholeNonNegativeInteger;
    }
    return numberFieldNames.has(row.fieldName)
        ? validateWholePositiveInteger
        : undefined;
}
