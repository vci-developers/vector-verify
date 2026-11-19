import { createElement, type ComponentProps } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
        isFetching: false,
        isError: false,
        refetch,
    });
});

test('reports pending until the file loads and opts tracked images into eager loading', () => {
    const onStatus = vi.fn();
    render(
        <SignedSpecimenImage
            path="image-path"
            alt="Specimen"
            onLoadStatusChange={onStatus}
        />,
    );
    expect(onStatus).toHaveBeenLastCalledWith('image-path', 'pending');
    const image = screen.getByAltText('Specimen');
    expect(image).toHaveAttribute('loading', 'eager');
    fireEvent.load(image);
    expect(onStatus).toHaveBeenLastCalledWith('image-path', 'loaded');
});

test('does not change lazy-loading defaults for other consumers', () => {
    render(<SignedSpecimenImage path="image-path" alt="Specimen" />);
    expect(screen.getByAltText('Specimen')).not.toHaveAttribute('loading');
});

test.each([
    { data: undefined, isPending: true, isError: false, expected: 'pending' },
    { data: undefined, isPending: false, isError: true, expected: 'error' },
    {
        data: { ok: false, error: { kind: 'not_found', status: 404 } },
        isPending: false,
        isError: false,
        expected: 'error',
    },
])('reports lookup state $expected', ({ expected, ...query }) => {
    mocks.signResource.mockReturnValue({ ...query, refetch });
    const onStatus = vi.fn();
    render(
        <SignedSpecimenImage
            path="image-path"
            alt="Specimen"
            onLoadStatusChange={onStatus}
        />,
    );
    expect(onStatus).toHaveBeenLastCalledWith('image-path', expected);
    if (expected === 'error')
        expect(screen.getByText('Image unavailable')).toBeInTheDocument();
});

test('remounts the image for a retry even when the signed URL is unchanged', async () => {
    const onStatus = vi.fn();
    render(
        <SignedSpecimenImage
            path="image-path"
            alt="Specimen"
            onLoadStatusChange={onStatus}
        />,
    );
    const firstImage = screen.getByAltText('Specimen');
    fireEvent.error(firstImage);
    expect(refetch).toHaveBeenCalledOnce();
    const retryImage = await screen.findByAltText('Specimen');
    expect(retryImage).not.toBe(firstImage);
    fireEvent.load(retryImage);
    expect(onStatus).toHaveBeenLastCalledWith('image-path', 'loaded');
});

test('reports a final rendering failure and recovers when a new signed URL loads', async () => {
    const onStatus = vi.fn();
    const { rerender } = render(
        <SignedSpecimenImage
            path="image-path"
            alt="Specimen"
            onLoadStatusChange={onStatus}
        />,
    );
    fireEvent.error(screen.getByAltText('Specimen'));
    fireEvent.error(await screen.findByAltText('Specimen'));
    expect(onStatus).toHaveBeenLastCalledWith('image-path', 'error');
    mocks.signResource.mockReturnValue({
        data: {
            ok: true,
            data: {
                ...signedResource,
                url: 'https://storage.example/retry.jpg',
            },
        },
        isPending: false,
        isFetching: false,
        refetch,
    });
    rerender(
        <SignedSpecimenImage
            path="image-path"
            alt="Specimen"
            onLoadStatusChange={onStatus}
        />,
    );
    expect(onStatus).toHaveBeenLastCalledWith('image-path', 'pending');
    fireEvent.load(screen.getByAltText('Specimen'));
    expect(onStatus).toHaveBeenLastCalledWith('image-path', 'loaded');
});

test('returns to pending while refreshing a signed URL', async () => {
    const onStatus = vi.fn();
    const { rerender } = render(
        <SignedSpecimenImage
            path="image-path"
            alt="Specimen"
            onLoadStatusChange={onStatus}
        />,
    );
    fireEvent.load(screen.getByAltText('Specimen'));
    mocks.signResource.mockReturnValue({
        data: { ok: true, data: signedResource },
        isPending: false,
        isFetching: true,
        refetch,
    });
    rerender(
        <SignedSpecimenImage
            path="image-path"
            alt="Specimen"
            onLoadStatusChange={onStatus}
        />,
    );
    await waitFor(() =>
        expect(onStatus).toHaveBeenLastCalledWith('image-path', 'pending'),
    );
});
