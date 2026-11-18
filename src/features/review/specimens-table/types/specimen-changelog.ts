import type { SpecimenClassificationAxis } from '@/api/specimen/validation/specimen-schema';

type PredictionChange = {
    field: SpecimenClassificationAxis;
    previousValue: string | null;
    value: string | null;
};

type SpecimenEdit = {
    id: number;
    reviewerName: string | null;
    createdAt: number;
} & (
    | {
          scope: 'image';
          imageNumber: number | null;
          imageId?: number;
          changes: PredictionChange[];
      }
    | {
          scope: 'specimen';
          imageNumber: null;
          imageId?: never;
          changes: {
              field: 'specimenId';
              previousValue: string;
              value: string;
          }[];
      }
);

export type SpecimenChangelog = {
    specimenId: string;
    sessionId: number;
    siteId: number;
    timezone: string;
    edits: SpecimenEdit[];
};
