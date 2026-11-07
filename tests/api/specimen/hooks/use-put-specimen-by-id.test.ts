import { createElement } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, test, vi } from 'vitest';
import { usePutSpecimenById } from '@/api/specimen/hooks/use-put-specimen-by-id';
import { createTestQueryClient } from '../../../helpers/create-query-client';

afterEach(() => {
    vi.unstubAllGlobals();
});

function renderMutation() {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => usePutSpecimenById(), {
        wrapper: ({ children }) =>
            createElement(
                QueryClientProvider,
                { client: queryClient },
                children,
            ),
    });
    return { result, queryClient };
}

test.each([
    null,
    [],
    {},
    { ok: 'true', data: {} },
    { ok: true },
    { ok: true, data: { message: 'Updated' } },
    { ok: false },
    { ok: false, error: { kind: 'unsupported' } },
    { ok: false, error: { kind: 'conflict', status: '409' } },
    { ok: false, error: { kind: 'client', message: 123 } },
])('rejects a malformed BFF Result: %j', async body => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(body)));
    const { result, queryClient } = renderMutation();
    await act(async () => {
        expect(
            await result.current.mutateAsync({
                specimenId: 12,
                requestBody: { specimenId: 'URJ206' },
            }),
        ).toEqual({ ok: false, error: { kind: 'client' } });
    });
    queryClient.clear();
});

test.each([
    {
        status: 200,
        body: {
            ok: true,
            data: {
                message: 'Updated',
                specimen: {
                    id: 12,
                    specimenId: 'URJ206',
                    sessionId: 4,
                    thumbnailUrl: null,
                    thumbnailImageId: null,
                    thumbnailImage: null,
                },
            },
        },
    },
    {
        status: 409,
        body: {
            ok: false,
            error: {
                kind: 'conflict',
                status: 409,
                message: 'A specimen with this id already exists',
            },
        },
    },
])('returns the BFF Result for HTTP $status', async ({ status, body }) => {
    const fetchMock = vi
        .fn()
        .mockResolvedValue(Response.json(body, { status }));
    vi.stubGlobal('fetch', fetchMock);
    const { result, queryClient } = renderMutation();

    await act(async () => {
        expect(
            await result.current.mutateAsync({
                specimenId: 12,
                requestBody: { specimenId: 'URJ206' },
            }),
        ).toEqual(body);
    });
    expect(fetchMock).toHaveBeenCalledWith('/api/specimens/12', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specimenId: 'URJ206' }),
    });
    queryClient.clear();
});
