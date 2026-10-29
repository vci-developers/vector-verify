import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';
import SpecimenImageCarousel from '@/components/specimen/specimen-image-carousel';
import SpecimenImagePreview from '@/features/review/specimens-table/components/specimen-image-preview';
import messages from '../../../../../messages/en.json';

vi.mock('@/components/specimen/specimen-image-carousel', () => ({
    default: vi.fn(() => null),
}));

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

const images = [
    { id: 99, url: 'first.jpg', species: null, sex: null, abdomenStatus: null },
    {
        id: 100,
        url: 'thumbnail.jpg',
        species: 'Culex',
        sex: 'Male',
        abdomenStatus: null,
    },
].map(image => ({
    ...image,
    appSpecies: null,
    appSex: null,
    appAbdomenStatus: null,
}));

test.each([images[1], null])(
    'previews list images without an extra fetch and preserves thumbnail metadata: %j',
    async thumbnailImage => {
        const specimen = specimenSchema.parse({
            id: 7,
            specimenId: 'CMS007',
            sessionId: 1401,
            thumbnailUrl: 'thumbnail.jpg',
            thumbnailImageId: 100,
            thumbnailImage,
            images,
        });
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        const user = userEvent.setup();
        render(
            <NextIntlClientProvider
                locale="en"
                timeZone="UTC"
                messages={messages}
            >
                <SpecimenImagePreview specimen={specimen} />
            </NextIntlClientProvider>,
        );
        expect(SpecimenImageCarousel).not.toHaveBeenCalled();
        await user.click(
            screen.getByRole('button', {
                name: 'Preview images for specimen CMS007',
            }),
        );
        expect(screen.getByRole('dialog')).toHaveClass(
            'grid-cols-1',
            'max-h-[90vh]',
            'overflow-y-auto',
        );
        const carouselProps = vi.mocked(SpecimenImageCarousel).mock
            .lastCall?.[0];
        expect(carouselProps?.specimen).toBe(specimen);
        expect(carouselProps?.enableKeyboardNavigation).toBe(true);
        expect(carouselProps?.onCurrentImageChange).toBeUndefined();
        expect(fetchMock).not.toHaveBeenCalled();
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    },
);
