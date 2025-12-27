import type { Annotation } from '@/shared/entities/annotation/model';
import { GENUS_VISUAL_IDS } from '../annotation-form-panel/validation/annotation-form-schema';
import { 
  isSexEnabled, 
  isAbdomenStatusEnabled 
} from '../annotation-form-panel/validation/morph-identification-form-schema';

export interface MorphFormDefaultValues {
  received: boolean;
  genus?: string;
  species?: string;
  sex?: string;
  abdomenStatus?: string;
}

export function parseMorphSpecies(morphSpecies?: string | null): {
  genus?: string;
  species?: string;
} {
  if (!morphSpecies) return {};

  if (morphSpecies.startsWith(GENUS_VISUAL_IDS.ANOPHELES)) {
    const species = morphSpecies.substring(GENUS_VISUAL_IDS.ANOPHELES.length);
    return {
      genus: GENUS_VISUAL_IDS.ANOPHELES,
      species: species || undefined,
    };
  }

  return { genus: morphSpecies };
}

export function buildSpeciesString(genus?: string, species?: string): string | null {
  if (!genus) return null;
  
  if (genus === GENUS_VISUAL_IDS.ANOPHELES && species) {
    return `${genus}${species}`;
  }
  
  return genus;
}

export function getMorphFormDefaultValues(
  annotation: Annotation,
): MorphFormDefaultValues {
  const { genus, species } = parseMorphSpecies(annotation.morphSpecies);
  

  const hasMorphData = (() => {
    if (!genus) return false;
    
    if (!isSexEnabled(genus)) {
      return true;
    }
    
    if (!annotation.morphSex) return false;
    
    if (isAbdomenStatusEnabled(genus, annotation.morphSex)) {
      return Boolean(annotation.morphAbdomenStatus);
    }
    
    return true;
  })();
  
  const received = hasMorphData;

  return {
    received,
    genus: received ? genus : undefined,
    species: received ? species : undefined,
    sex: received ? (annotation.morphSex ?? undefined) : undefined,
    abdomenStatus: received
      ? (annotation.morphAbdomenStatus ?? undefined)
      : undefined,
  };
}
