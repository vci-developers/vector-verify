import { expect, test, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { getLatestReleaseNotes } from '@/features/release-notes/server/get-release-notes';

test('reads the latest release and its summaries from the MDX page', () => {
    expect(getLatestReleaseNotes()).toEqual({
        id: '2026-11-03',
        date: '2026-11-03',
        title: 'November 3, 2026 - Metadata Review, Prediction Editing & Clearer Charts',
        changes: [
            {
                id: 'metadata-review',
                title: 'Metadata review',
                summary:
                    'Forms are easier to fill in, and older sessions display their original answers properly.',
            },
            {
                id: 'image-review',
                title: 'Image review',
                summary:
                    "You can now correct a specimen's predictions from any thumbnail.",
            },
            {
                id: 'operations',
                title: 'Operations',
                summary: 'Specimen composition charts now show totals and percentages.',
            },
            {
                id: 'miscellaneous',
                title: 'Miscellaneous',
                summary: 'Smaller fixes across the app.',
            },
        ],
    });
});
