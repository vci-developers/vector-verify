import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
import { format } from 'date-fns';

export interface SpecimenReviewImage {
    id: string;
    src: string;
    alt: string;
    specimenId: string;
    sessionLabel: string;
    collectionDateLabel: string;
    sortTimestamp: number;
}

function buildImageSrc(url: string): string {
    if (url.startsWith('/api') || url.startsWith('http')) return url;
    if (url.startsWith('/')) return `/api${url}`;
    return url;
}

function formatCollectionDate(collectionDate: number | null): string {
    if (!collectionDate) return 'Unknown date';
    return format(new Date(collectionDate), 'MMM d, yyyy');
}

function buildSessionLabel(specimen: Specimen): string {
    return specimen.session?.sessionId
        ? `Session ${specimen.session.sessionId}`
        : 'Unknown session';
}

function specimenImageToReviewImage(
    specimen: Specimen,
    image: SpecimenImage,
    imageIndex: number,
): SpecimenReviewImage {
    const collectionDate = specimen.session?.collectionDate ?? null;

    return {
        id: `${specimen.id}-${image.id}`,
        src: buildImageSrc(image.url),
        alt: `Specimen ${specimen.specimenId} image ${imageIndex + 1}`,
        specimenId: specimen.specimenId,
        sessionLabel: buildSessionLabel(specimen),
        collectionDateLabel: formatCollectionDate(collectionDate),
        sortTimestamp: image.capturedAt ?? collectionDate ?? 0,
    };
}

function thumbnailToReviewImage(specimen: Specimen): SpecimenReviewImage | null {
    if (!specimen.thumbnailUrl) return null;

    const collectionDate = specimen.session?.collectionDate ?? null;

    return {
        id: `${specimen.id}-thumbnail-${specimen.thumbnailImageId ?? 'image'}`,
        src: buildImageSrc(specimen.thumbnailUrl),
        alt: `Specimen ${specimen.specimenId}`,
        specimenId: specimen.specimenId,
        sessionLabel: buildSessionLabel(specimen),
        collectionDateLabel: formatCollectionDate(collectionDate),
        sortTimestamp: collectionDate ?? 0,
    };
}

export function buildSpecimenReviewImages(
    specimens: Specimen[],
): SpecimenReviewImage[] {
    return specimens
        .flatMap(specimen => {
            if (specimen.images?.length) {
                return specimen.images.map((image, imageIndex) =>
                    specimenImageToReviewImage(specimen, image, imageIndex),
                );
            }

            const thumbnailImage = thumbnailToReviewImage(specimen);
            return thumbnailImage ? [thumbnailImage] : [];
        })
        .sort(
            (left, right) =>
                left.sortTimestamp - right.sortTimestamp ||
                left.specimenId.localeCompare(right.specimenId),
        );
}
