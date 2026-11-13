import { afterEach, expect, test, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { getBuiltReleaseNotes } from '@/features/release-notes/server/get-built-release-notes';

const release = {
    id: '2026-11-03',
    date: '2026-11-03',
    title: 'November 3, 2026',
    changes: [
        {
            id: 'image-review',
            title: 'Image review',
            summary: 'Correct the predicted species on any thumbnail.',
        },
    ],
};

afterEach(() => {
    vi.unstubAllEnvs();
});

test('decodes the built release data', () => {
    vi.stubEnv('RELEASE_NOTES_DATA', JSON.stringify(release));

    expect(getBuiltReleaseNotes()).toEqual(release);
});

test('returns null when no release data was embedded', () => {
    vi.stubEnv('RELEASE_NOTES_DATA', undefined);

    expect(getBuiltReleaseNotes()).toBeNull();
});

test.each([
    '{',
    JSON.stringify({ ...release, changes: [{ id: 'image-review' }] }),
])('rejects invalid release data: %s', serializedRelease => {
    vi.stubEnv('RELEASE_NOTES_DATA', serializedRelease);

    expect(() => getBuiltReleaseNotes()).toThrow();
});
