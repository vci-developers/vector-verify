import { createElement, type ComponentProps } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SpecimenImageCarousel from '@/components/specimen/specimen-image-carousel';
import type SignedSpecimenImage from '@/components/specimen/signed-specimen-image';
import { createSpecimen } from '../../helpers/create-specimen';

const mocks = vi.hoisted(() => ({
    api: {
        scrollPrev: vi.fn(),
        scrollNext: vi.fn(),
        scrollTo: vi.fn(),
        canScrollPrev: (): boolean => true,
        canScrollNext: (): boolean => true,
        selectedScrollSnap: () => 0,
        on: vi.fn(),
        off: vi.fn(),
        reInit: vi.fn(),
    },
    ref: vi.fn(),
}));
vi.mock('embla-carousel-react', () => ({
    default: () => [mocks.ref, mocks.api],
}));
vi.mock('@/components/specimen/signed-specimen-image', () => ({
    default: ({ alt }: ComponentProps<typeof SignedSpecimenImage>) =>
        createElement('img', { alt }),
}));
beforeEach(() => vi.clearAllMocks());

const specimen = createSpecimen();

test('preserves the carousel capability gate when navigation is not locked', () => {
    vi.spyOn(mocks.api, 'canScrollPrev').mockReturnValue(false);
    vi.spyOn(mocks.api, 'canScrollNext').mockReturnValue(false);
    render(<SpecimenImageCarousel specimen={specimen} />);
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    expect(
        screen.getByRole('button', { name: 'Previous slide' }),
    ).toBeDisabled();
});

test('blocks buttons, thumbnails, local/global arrows, and drag while locked', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
        <SpecimenImageCarousel
            specimen={specimen}
            enableKeyboardNavigation
            navigationDisabled
        />,
    );
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    expect(
        screen.getByRole('button', { name: 'Previous slide' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Show image 2' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Show image 2' }));
    fireEvent.keyDown(
        screen.getByRole('region', { name: 'Specimen image carousel' }),
        { key: 'ArrowRight' },
    );
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(mocks.api.scrollTo).not.toHaveBeenCalled();
    expect(mocks.api.scrollNext).not.toHaveBeenCalled();
    expect(mocks.api.scrollPrev).not.toHaveBeenCalled();
    expect(mocks.api.reInit).toHaveBeenCalledWith(
        expect.objectContaining({ watchDrag: false }),
    );

    rerender(
        <SpecimenImageCarousel specimen={specimen} enableKeyboardNavigation />,
    );
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Show image 2' }));
    expect(mocks.api.scrollTo).toHaveBeenCalledWith(1);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mocks.api.scrollNext).toHaveBeenCalledOnce();
    expect(mocks.api.reInit).toHaveBeenLastCalledWith(
        expect.objectContaining({ watchDrag: true }),
    );
});
