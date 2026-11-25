import type { SpecimenClassificationAxis } from '@/api/specimen/validation/specimen-schema';

type PredictionChange = {
    field: SpecimenClassificationAxis;
    previousValue: string | null;
    value: string | null;
};

type PredictionEdit = {
    id: number;
    reviewerName: string | null;
    createdAt: number;
    imageNumber: number | null;
    imageId?: number;
    changes: PredictionChange[];
};

export type SpecimenChangelog = {
    specimenId: string;
    sessionId: number;
    siteId: number;
    timezone: string;
    edits: PredictionEdit[];
};
