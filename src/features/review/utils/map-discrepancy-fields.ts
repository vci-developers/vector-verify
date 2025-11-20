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
  const resolvedData: any = {};
  const resolvedSurveillanceForm: any = {};

  const parseValue = (value: string | undefined, type: 'string' | 'number' | 'boolean' = 'string') => {
    if (!value || value.toLowerCase() === 'null' || value.toLowerCase() === 'n/a') {
      return null;
    }
    if (type === 'number') {
      return parseInt(value) || null;
    }
    if (type === 'boolean') {
      return value.toLowerCase() === 'yes';
    }
    return value;
  };

  fields.forEach(field => {
    const value = values[field.key];
    
    switch (field.key) {
      case 'collectorName':
        resolvedData.collectorName = parseValue(value, 'string');
        break;
      case 'collectorTitle':
        resolvedData.collectorTitle = parseValue(value, 'string');
        break;
      case 'collectionMethod':
        resolvedData.collectionMethod = parseValue(value, 'string');
        break;
      case 'numPeopleSleptInHouse':
        resolvedSurveillanceForm.numPeopleSleptInHouse = parseValue(value, 'number');
        break;
      case 'wasIrsConducted':
        resolvedSurveillanceForm.wasIrsConducted = parseValue(value, 'boolean');
        break;
      case 'monthsSinceIrs':
        resolvedSurveillanceForm.monthsSinceIrs = parseValue(value, 'number');
        break;
      case 'numLlinsAvailable':
        resolvedSurveillanceForm.numLlinsAvailable = parseValue(value, 'number');
        break;
      case 'llinType':
        resolvedSurveillanceForm.llinType = parseValue(value, 'string');
        break;
      case 'llinBrand':
        resolvedSurveillanceForm.llinBrand = parseValue(value, 'string');
        break;
      case 'numPeopleSleptUnderLlin':
        resolvedSurveillanceForm.numPeopleSleptUnderLlin = parseValue(value, 'number');
        break;
    }
  });

  
  Object.keys(values).forEach(key => {
    const value = values[key];
    
    if (fields.some(f => f.key === key)) {
      return;
    }

    switch (key) {
      case 'monthsSinceIrs':
        resolvedSurveillanceForm.monthsSinceIrs = parseValue(value, 'number');
        break;
      case 'numPeopleSleptUnderLlin':
        resolvedSurveillanceForm.numPeopleSleptUnderLlin = parseValue(value, 'number');
        break;
      case 'llinType':
        resolvedSurveillanceForm.llinType = parseValue(value, 'string');
        break;
      case 'llinBrand':
        resolvedSurveillanceForm.llinBrand = parseValue(value, 'string');
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
