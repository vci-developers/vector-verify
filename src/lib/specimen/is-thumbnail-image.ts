import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';

export function isThumbnailImage(specimen: Specimen, image: SpecimenImage) {
    return (
        image.id === specimen.thumbnailImageId ||
        image.id === specimen.thumbnailImage?.id ||
        image.url === specimen.thumbnailUrl
    );
}
