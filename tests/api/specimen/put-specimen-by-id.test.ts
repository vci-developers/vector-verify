import { afterEach, expect, test, vi } from 'vitest';
import { putSpecimenById } from '@/api/specimen/put-specimen-by-id';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/network/construct-url', () => ({
    constructUrl: (path: string) => `https://backend.example${path}`,
}));

afterEach(() => {
    vi.unstubAllGlobals();
});

const responseBody = {
    message: 'Specimen updated',
    specimen: {
        id: 12,
        specimenId: 'URJ206',
        sessionId: 4,
        thumbnailUrl: null,
        thumbnailImageId: null,
        thumbnailImage: null,
    },
};

test('PUT uses the numeric ID and submits the trimmed value with auth', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(responseBody));
    vi.stubGlobal('fetch', fetchMock);

    expect(
        await putSpecimenById('access-token', 12, { specimenId: ' URJ206 ' }),
    ).toEqual({ ok: true, data: responseBody });
    expect(fetchMock).toHaveBeenCalledWith(
        'https://backend.example/specimens/12',
        expect.objectContaining({
            method: 'PUT',
            cache: 'no-cache',
            headers: {
                Authorization: 'Bearer access-token',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ specimenId: 'URJ206' }),
        }),
    );
});

test('invalid input returns 400 without calling the backend', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(
        await putSpecimenById('access-token', 12, { specimenId: ' \t ' }),
    ).toEqual({ ok: false, error: { kind: 'client', status: 400 } });
    expect(fetchMock).not.toHaveBeenCalled();
});

test('preserves duplicate status and message', async () => {
    vi.stubGlobal(
        'fetch',
        vi
            .fn()
            .mockResolvedValue(
                Response.json(
                    { error: 'A specimen with this id already exists' },
                    { status: 409 },
                ),
            ),
    );

    expect(
        await putSpecimenById('access-token', 12, { specimenId: 'URJ206' }),
    ).toEqual({
        ok: false,
        error: {
            kind: 'conflict',
            status: 409,
            message: 'A specimen with this id already exists',
        },
    });
});

test('rejects malformed backend success data', async () => {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(Response.json({ message: 'Updated' })),
    );
    expect(
        await putSpecimenById('access-token', 12, { specimenId: 'URJ206' }),
    ).toEqual({ ok: false, error: { kind: 'client' } });
});

test('wraps a failed backend connection in a Result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')));
    expect(
        await putSpecimenById('access-token', 12, { specimenId: 'URJ206' }),
    ).toEqual({
        ok: false,
        error: { kind: 'network', message: 'Offline' },
    });
});
