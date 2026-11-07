import {
    specimenSchema,
    type Specimen,
} from '@/api/specimen/validation/specimen-schema';

export function createSpecimen(overrides: Partial<Specimen> = {}): Specimen {
    const thumbnailImage = {
        id: 101,
        url: '/specimens/12/images/101',
        species: 'Culex',
        sex: 'Female',
        abdomenStatus: 'Unfed',
        appSpecies: 'Culex',
        appSex: 'Female',
        appAbdomenStatus: 'Unfed',
    };
    const images = [
        thumbnailImage,
        { ...thumbnailImage, id: 102, url: '/specimens/12/images/102' },
    ];
    return specimenSchema.parse({
        id: 12,
        specimenId: 'URJ206',
        sessionId: 4,
        thumbnailUrl: thumbnailImage.url,
        thumbnailImageId: thumbnailImage.id,
        thumbnailImage,
        expectedImages: 2,
        images,
        ...overrides,
    });
}
