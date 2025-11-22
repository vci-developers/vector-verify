import type { SiteDiscrepancySummary } from '@/features/review/types';
import type { SurveillanceForm } from '@/shared/entities/surveillance-form/model';

interface MappedDiscrepancyData {
  resolvedData: {
    collectorName?: string;
    collectorTitle?: string;
    collectionMethod?: string;
    type: 'SURVEILLANCE';
  };
  resolvedSurveillanceForm?: SurveillanceForm;
}


export function mapDiscrepancyFields(
  fields: SiteDiscrepancySummary['fields'],
  values: Record<string, string>
): MappedDiscrepancyData {
  const resolvedData: Partial<MappedDiscrepancyData['resolvedData']> = {};
  const resolvedSurveillanceForm: Partial<SurveillanceForm> = {};

  const parseValue = (
    value: string | undefined,
    type: 'string' | 'number' | 'boolean' = 'string',
  ) => {
    if (!value || value.toLowerCase() === 'null' || value.toLowerCase() === 'n/a') {
      return null;
    }
    if (type === 'number') {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (type === 'boolean') {
      return value.toLowerCase() === 'yes';
    }
    return value;
  };

  fields.forEach(field => {
    const value = values[field.key];

    switch (field.key) {
      case 'collectorName': {
        const parsed = parseValue(value, 'string');
        resolvedData.collectorName =
          parsed === null ? undefined : (parsed as string);
        break;
      }
      case 'collectorTitle': {
        const parsed = parseValue(value, 'string');
        resolvedData.collectorTitle =
          parsed === null ? undefined : (parsed as string);
        break;
      }
      case 'collectionMethod': {
        const parsed = parseValue(value, 'string');
        resolvedData.collectionMethod =
          parsed === null ? undefined : (parsed as string);
        break;
      }
      case 'numPeopleSleptInHouse': {
        const parsed = parseValue(value, 'number');
        resolvedSurveillanceForm.numPeopleSleptInHouse =
          (parsed as number | null) ?? null;
        break;
      }
      case 'wasIrsConducted': {
        const parsed = parseValue(value, 'boolean');
        resolvedSurveillanceForm.wasIrsConducted =
          (parsed as boolean | null) ?? null;
        break;
      }
      case 'monthsSinceIrs': {
        const parsed = parseValue(value, 'number');
        resolvedSurveillanceForm.monthsSinceIrs =
          (parsed as number | null) ?? null;
        break;
      }
      case 'numLlinsAvailable': {
        const parsed = parseValue(value, 'number');
        resolvedSurveillanceForm.numLlinsAvailable =
          (parsed as number | null) ?? null;
        break;
      }
      case 'llinType': {
        const parsed = parseValue(value, 'string');
        resolvedSurveillanceForm.llinType =
          parsed === null ? undefined : (parsed as string);
        break;
      }
      case 'llinBrand': {
        const parsed = parseValue(value, 'string');
        resolvedSurveillanceForm.llinBrand =
          parsed === null ? undefined : (parsed as string);
        break;
      }
      case 'numPeopleSleptUnderLlin': {
        const parsed = parseValue(value, 'number');
        resolvedSurveillanceForm.numPeopleSleptUnderLlin =
          (parsed as number | null) ?? null;
        break;
      }
      default:
        break;
    }
  });

  
  Object.keys(values).forEach(key => {
    if (fields.some(f => f.key === key)) {
      return;
    }

    const value = values[key];

    switch (key) {
      case 'monthsSinceIrs': {
        const parsed = parseValue(value, 'number');
        resolvedSurveillanceForm.monthsSinceIrs =
          (parsed as number | null) ?? null;
        break;
      }
      case 'numPeopleSleptUnderLlin': {
        const parsed = parseValue(value, 'number');
        resolvedSurveillanceForm.numPeopleSleptUnderLlin =
          (parsed as number | null) ?? null;
        break;
      }
      case 'llinType': {
        const parsed = parseValue(value, 'string');
        resolvedSurveillanceForm.llinType =
          parsed === null ? undefined : (parsed as string);
        break;
      }
      case 'llinBrand': {
        const parsed = parseValue(value, 'string');
        resolvedSurveillanceForm.llinBrand =
          parsed === null ? undefined : (parsed as string);
        break;
      }
      default:
        break;
    }
  });

  return {
    resolvedData: Object.keys(resolvedData).length > 0 
      ? { ...resolvedData, type: 'SURVEILLANCE' as const }
      : { type: 'SURVEILLANCE' as const },
    resolvedSurveillanceForm: Object.keys(resolvedSurveillanceForm).length > 0 
      ? (resolvedSurveillanceForm as SurveillanceForm)
      : undefined,
  };
}
