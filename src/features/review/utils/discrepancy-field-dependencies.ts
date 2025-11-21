import type { SiteDiscrepancySummary } from '@/features/review/types';


export const FIELD_KEYS = {
  WAS_IRS_CONDUCTED: 'wasIrsConducted',
  MONTHS_SINCE_IRS: 'monthsSinceIrs',
  NUM_LLINS_AVAILABLE: 'numLlinsAvailable',
  NUM_PEOPLE_SLEPT_UNDER_LLIN: 'numPeopleSleptUnderLlin',
  LLIN_TYPE: 'llinType',
  LLIN_BRAND: 'llinBrand',
} as const;


export function calculateDependentFields(
  fieldKey: string,
  value: string,
  allFields: SiteDiscrepancySummary['fields']
): Record<string, string> {
  const updatedValues: Record<string, string> = {};

  if (fieldKey === FIELD_KEYS.WAS_IRS_CONDUCTED && value.toLowerCase() === 'no') {
    const monthsSinceIrsField = allFields.find(f => f.key === FIELD_KEYS.MONTHS_SINCE_IRS);
    if (monthsSinceIrsField) {
      updatedValues[FIELD_KEYS.MONTHS_SINCE_IRS] = 'N/A';
    }
  }

  if (
    fieldKey === FIELD_KEYS.NUM_LLINS_AVAILABLE &&
    (value === '0' || value.toLowerCase() === 'zero')
  ) {
    const peopleSleptUnderLlinField = allFields.find(
      f => f.key === FIELD_KEYS.NUM_PEOPLE_SLEPT_UNDER_LLIN
    );
    const llinTypeField = allFields.find(f => f.key === FIELD_KEYS.LLIN_TYPE);
    const llinBrandField = allFields.find(f => f.key === FIELD_KEYS.LLIN_BRAND);

    if (peopleSleptUnderLlinField) {
      updatedValues[FIELD_KEYS.NUM_PEOPLE_SLEPT_UNDER_LLIN] = '0';
    }
    if (llinTypeField) {
      updatedValues[FIELD_KEYS.LLIN_TYPE] = 'N/A';
    }
    if (llinBrandField) {
      updatedValues[FIELD_KEYS.LLIN_BRAND] = 'N/A';
    }
  }

  return updatedValues;
}


export function shouldDisableField(
  fieldKey: string,
  currentValues: Record<string, string>
): boolean {
  if (fieldKey === FIELD_KEYS.MONTHS_SINCE_IRS) {
    const wasIrsConducted = currentValues[FIELD_KEYS.WAS_IRS_CONDUCTED];
    return wasIrsConducted?.toLowerCase() === 'no';
  }

  const llinDependentFields: string[] = [
    FIELD_KEYS.NUM_PEOPLE_SLEPT_UNDER_LLIN,
    FIELD_KEYS.LLIN_TYPE,
    FIELD_KEYS.LLIN_BRAND,
  ];

  if (llinDependentFields.includes(fieldKey)) {
    const numLlinsAvailable = currentValues[FIELD_KEYS.NUM_LLINS_AVAILABLE];
    return numLlinsAvailable === '0' || numLlinsAvailable?.toLowerCase() === 'zero';
  }

  return false;
}


export function parseFieldOptions(details: string): string[] {
  return details
    .split('•')
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0);
}
