import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';

export type SpecimenImageCarouselItem = SpecimenImage & {
    isThumbnail: boolean;
};

export function getSpecimenImageCarouselItems(
    specimen: Specimen,
): SpecimenImageCarouselItem[] {
    const allImagesForSpecimen = specimen.images ?? [];
    const thumbnailImageId =
        specimen.thumbnailImageId ?? specimen.thumbnailImage?.id ?? null;
    const thumbnailImageFromList =
        thumbnailImageId != null
            ? allImagesForSpecimen.find(image => image.id === thumbnailImageId)
            : undefined;
    const thumbnailImage =
        thumbnailImageFromList ??
        specimen.thumbnailImage ??
        (specimen.thumbnailUrl
            ? {
                  id: thumbnailImageId ?? -1,
                  url: specimen.thumbnailUrl,
                  species: null,
                  sex: null,
                  abdomenStatus: null,
              }
            : null);

    if (!thumbnailImage) {
        return allImagesForSpecimen.map(image => ({
            ...image,
            isThumbnail: false,
        }));
    }

    const thumbnailCarouselItem = {
        ...thumbnailImage,
        isThumbnail: true,
    };
    const remainingImages = allImagesForSpecimen.filter(image => {
        if (image.id === thumbnailImage.id) return false;
        if (!thumbnailImageFromList && image.url === thumbnailImage.url) {
            return false;
        }

        return true;
    });

    return [
        thumbnailCarouselItem,
        ...remainingImages.map(image => ({
            ...image,
            isThumbnail: image.id === thumbnailImageId,
        })),
    ];
}
