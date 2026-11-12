import { expect, test, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { getLatestReleaseNotes } from '@/features/release-notes/server/get-release-notes';

test('reads the latest release and its summaries from the MDX page', () => {
    expect(getLatestReleaseNotes()).toEqual({
        id: '2026-11-03',
        date: '2026-11-03',
        title: 'November 3, 2026',
        changes: [
            {
                id: 'metadata-review',
                title: 'Metadata review',
                summary:
                    'Forms are easier to fill in. Date fields now have a calendar picker, and older sessions keep their original answers.',
            },
            {
                id: 'image-review',
                title: 'Image review',
                summary:
                    'You can now correct the predicted species on any thumbnail.',
            },
            {
                id: 'dashboard',
                title: 'Dashboard',
                summary:
                    'Graphs now show totals and percentages, and annotation tasks show how many are left.',
            },
            {
                id: 'general',
                title: 'General',
                summary:
                    'Bug fixes and improvements to dropdowns and permissions.',
            },
        ],
    });
});
