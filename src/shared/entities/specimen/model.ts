import type { Session } from '@/shared/entities/session/model';
import type { SpecimenImage } from '@/shared/entities/specimen-image/model';

export interface Specimen {
  id: number;
  specimenId: string;
  sessionId: number;
  thumbnailUrl: string | null;
  thumbnailImageId: number | null;
  images?: SpecimenImage[];
  thumbnailImage?: SpecimenImage | null;
  session?: Session;
}
