import { createElement, type ComponentProps } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SignedSpecimenImage from '@/components/specimen/signed-specimen-image';

const mocks = vi.hoisted(() => ({ signResource: vi.fn() }));
vi.mock('@/api/resources/hooks/use-signed-resource-url', () => ({
    useSignedResourceUrl: mocks.signResource,
}));
vi.mock('next/image', () => ({
    default: ({ src, alt, onLoad, onError, loading }: ComponentProps<'img'>) =>
        createElement('img', { src, alt, onLoad, onError, loading }),
}));

const signedResource = {
    url: 'https://storage.example/image.jpg',
    expiresAt: 4_000_000_000,
};
const refetch = vi.fn();

beforeEach(() => {
    refetch.mockReset().mockResolvedValue({});
    mocks.signResource.mockReturnValue({
        data: { ok: true, data: signedResource },
        isPending: false,
        isError: false,
        refetch,
    });
});

test('uses default loading behavior and shows a spinner until the file loads', () => {
    render(<SignedSpecimenImage path="image-path" alt="Specimen" />);
    const image = screen.getByAltText('Specimen');
    expect(image).not.toHaveAttribute('loading');
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    fireEvent.load(image);
    expect(
        screen.queryByRole('status', { name: 'Loading' }),
    ).not.toBeInTheDocument();
});

test('shows an unavailable message when the image lookup fails', () => {
    mocks.signResource.mockReturnValue({
        data: { ok: false, error: { kind: 'not_found', status: 404 } },
        isPending: false,
        isError: false,
        refetch,
    });
    render(<SignedSpecimenImage path="image-path" alt="Specimen" />);
    expect(screen.getByText('Image unavailable')).toBeInTheDocument();
});

test('retries an image load once and recovers when a new signed URL arrives', async () => {
    const image = <SignedSpecimenImage path="image-path" alt="Specimen" />;
    const { rerender } = render(image);
    const firstImage = screen.getByAltText('Specimen');
    fireEvent.error(firstImage);
    expect(refetch).toHaveBeenCalledOnce();
    const retryImage = await screen.findByAltText('Specimen');
    expect(retryImage).not.toBe(firstImage);
    fireEvent.error(retryImage);
    expect(screen.getByText('Image unavailable')).toBeInTheDocument();

    mocks.signResource.mockReturnValue({
        data: {
            ok: true,
            data: {
                ...signedResource,
                url: 'https://storage.example/retry.jpg',
            },
        },
        isPending: false,
        refetch,
    });
    rerender(<SignedSpecimenImage path="image-path" alt="Specimen" />);
    fireEvent.load(screen.getByAltText('Specimen'));
    expect(screen.queryByText('Image unavailable')).not.toBeInTheDocument();
    expect(
        screen.queryByRole('status', { name: 'Loading' }),
    ).not.toBeInTheDocument();
});
