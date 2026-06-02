import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';

export function detectPredictionConflict(images: SpecimenImage[]): boolean {
    if (images.length < 2) return false;

    const axes = ['species', 'sex', 'abdomenStatus'] as const;

    return axes.some(axis => {
        const values = new Set(images.map(image => image[axis]));
        return values.size > 1;
    });
}
