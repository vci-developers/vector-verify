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

  fields.forEach(field => {
    const value = values[field.key];
    
    switch (field.key) {
      case 'collectorName':
        resolvedData.collectorName = value;
        break;
      case 'collectorTitle':
        resolvedData.collectorTitle = value;
        break;
      case 'collectionMethod':
        resolvedData.collectionMethod = value;
        break;
      case 'numPeopleSleptInHouse':
        resolvedSurveillanceForm.numPeopleSleptInHouse = parseInt(value) || null;
        break;
      case 'wasIrsConducted':
        resolvedSurveillanceForm.wasIrsConducted = value.toLowerCase() === 'yes';
        break;
      case 'monthsSinceIrs':
        resolvedSurveillanceForm.monthsSinceIrs = parseInt(value) || null;
        break;
      case 'numLlinsAvailable':
        resolvedSurveillanceForm.numLlinsAvailable = parseInt(value) || null;
        break;
      case 'llinType':
        resolvedSurveillanceForm.llinType = value;
        break;
      case 'llinBrand':
        resolvedSurveillanceForm.llinBrand = value;
        break;
      case 'numPeopleSleptUnderLlin':
        resolvedSurveillanceForm.numPeopleSleptUnderLlin = parseInt(value) || null;
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
