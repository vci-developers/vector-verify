import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { PUT } from '@/app/api/specimens/[specimenId]/route';
import { putSpecimenById } from '@/api/specimen/put-specimen-by-id';
import { cookies } from 'next/headers';

vi.mock('server-only', () => ({}));
vi.mock('@/api/specimen/put-specimen-by-id', () => ({
    putSpecimenById: vi.fn(),
}));
vi.mock('next/headers', () => ({ cookies: vi.fn() }));

beforeEach(() => {
    vi.mocked(cookies).mockResolvedValue({
        get: () => ({ value: 'access-token' }),
    } as unknown as Awaited<ReturnType<typeof cookies>>);
});

afterEach(() => {
    vi.mocked(putSpecimenById).mockReset();
});

function updateRequest(body = JSON.stringify({ specimenId: 'URJ206' })) {
    return new Request('http://localhost/api/specimens/12', {
        method: 'PUT',
        body,
        headers: { 'Content-Type': 'application/json' },
    });
}

test('forwards a numeric ID and returns the success Result', async () => {
    const outcome = {
        ok: true as const,
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
    };
    vi.mocked(putSpecimenById).mockResolvedValue(outcome);
    const response = await PUT(updateRequest(), {
        params: Promise.resolve({ specimenId: '12' }),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(outcome);
    expect(putSpecimenById).toHaveBeenCalledWith('access-token', 12, {
        specimenId: 'URJ206',
    });
});

test('keeps a duplicate error as HTTP 409 with its Result body', async () => {
    const outcome = {
        ok: false as const,
        error: {
            kind: 'conflict' as const,
            status: 409,
            message: 'A specimen with this id already exists',
        },
    };
    vi.mocked(putSpecimenById).mockResolvedValue(outcome);
    const response = await PUT(updateRequest(), {
        params: Promise.resolve({ specimenId: '12' }),
    });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual(outcome);
});

test('requires a session before calling the backend', async () => {
    vi.mocked(cookies).mockResolvedValue({
        get: () => undefined,
    } as unknown as Awaited<ReturnType<typeof cookies>>);
    const response = await PUT(updateRequest(), {
        params: Promise.resolve({ specimenId: '12' }),
    });
    expect(response.status).toBe(401);
    expect(putSpecimenById).not.toHaveBeenCalled();
});

test('rejects malformed JSON without calling the backend', async () => {
    const response = await PUT(updateRequest('{'), {
        params: Promise.resolve({ specimenId: '12' }),
    });
    expect(response.status).toBe(400);
    expect(putSpecimenById).not.toHaveBeenCalled();
});

test.each(['URJ206', '0', '-1', '1.5', '9007199254740992'])(
    'rejects invalid numeric path ID %s',
    async specimenId => {
        const response = await PUT(updateRequest(), {
            params: Promise.resolve({ specimenId }),
        });
        expect(response.status).toBe(400);
        expect(putSpecimenById).not.toHaveBeenCalled();
    },
);
