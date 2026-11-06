import type { Specimen } from '@/api/specimen/validation/specimen-schema';

export function getOrderedSpecimenImages(specimen: Specimen) {
    const allImages = specimen.images ?? [];
    const thumbnailImageId =
        specimen.thumbnailImageId ?? specimen.thumbnailImage?.id ?? null;
    const thumbnailImageFromList =
        thumbnailImageId != null
            ? allImages.find(image => image.id === thumbnailImageId)
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
                  appSpecies: null,
                  appSex: null,
                  appAbdomenStatus: null,
              }
            : null);

    if (!thumbnailImage) {
        return allImages;
    }

    return [
        thumbnailImage,
        ...allImages.filter(
            image =>
                image.id !== thumbnailImage.id &&
                image.url !== thumbnailImage.url,
        ),
    ];
}
