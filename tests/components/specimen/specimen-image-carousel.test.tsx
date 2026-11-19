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
    default: ({
        path,
        alt,
        onLoadStatusChange,
    }: ComponentProps<typeof SignedSpecimenImage>) =>
        createElement('img', {
            alt,
            'data-testid': onLoadStatusChange ? path : undefined,
            onLoad: () => onLoadStatusChange?.(path, 'loaded'),
            onError: () => onLoadStatusChange?.(path, 'error'),
        }),
}));
beforeEach(() => vi.clearAllMocks());

const specimen = createSpecimen();

test('waits for every image, including an unselected one, and allows recovery', () => {
    const onStatus = vi.fn();
    render(
        <SpecimenImageCarousel
            specimen={specimen}
            onImageAvailabilityChange={onStatus}
        />,
    );
    expect(onStatus).toHaveBeenLastCalledWith('pending');
    fireEvent.load(screen.getByTestId('/specimens/12/images/101'));
    expect(onStatus).toHaveBeenLastCalledWith('pending');
    fireEvent.error(screen.getByTestId('/specimens/12/images/102'));
    expect(onStatus).toHaveBeenLastCalledWith('error');
    fireEvent.load(screen.getByTestId('/specimens/12/images/102'));
    expect(onStatus).toHaveBeenLastCalledWith('loaded');
});

test('a failed image does not hide pending checks for other images', () => {
    const onStatus = vi.fn();
    render(
        <SpecimenImageCarousel
            specimen={specimen}
            onImageAvailabilityChange={onStatus}
        />,
    );
    fireEvent.error(screen.getByTestId('/specimens/12/images/102'));
    expect(onStatus).toHaveBeenLastCalledWith('pending');
    fireEvent.load(screen.getByTestId('/specimens/12/images/101'));
    expect(onStatus).toHaveBeenLastCalledWith('error');
});

test('new image paths invalidate prior successful availability', () => {
    const onStatus = vi.fn();
    const { rerender } = render(
        <SpecimenImageCarousel
            specimen={specimen}
            onImageAvailabilityChange={onStatus}
        />,
    );
    screen
        .getAllByAltText('Specimen URJ206')
        .forEach(image => fireEvent.load(image));
    expect(onStatus).toHaveBeenLastCalledWith('loaded');
    const changedSpecimen = {
        ...specimen,
        images: specimen.images?.map(image => ({
            ...image,
            url: `${image.url}/new`,
        })),
    };
    rerender(
        <SpecimenImageCarousel
            specimen={changedSpecimen}
            onImageAvailabilityChange={onStatus}
        />,
    );
    expect(onStatus).toHaveBeenLastCalledWith('pending');
});

test('resets availability when switching keyed specimens', () => {
    const onStatus = vi.fn();
    const { rerender } = render(
        <SpecimenImageCarousel
            key={12}
            specimen={specimen}
            onImageAvailabilityChange={onStatus}
        />,
    );
    fireEvent.load(screen.getByTestId('/specimens/12/images/101'));
    fireEvent.error(screen.getByTestId('/specimens/12/images/102'));
    expect(onStatus).toHaveBeenLastCalledWith('error');
    rerender(
        <SpecimenImageCarousel
            key={13}
            specimen={createSpecimen({ id: 13 })}
            onImageAvailabilityChange={onStatus}
        />,
    );
    expect(onStatus).toHaveBeenLastCalledWith('pending');
});

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
