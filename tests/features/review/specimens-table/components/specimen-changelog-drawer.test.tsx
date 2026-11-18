import { expect, test } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import type { SpecimenChangelog } from '@/features/review/specimens-table/types/specimen-changelog';
import SpecimenChangelogDrawer from '@/features/review/specimens-table/components/specimen-changelog-drawer';
import defaultMessages from '../../../../../messages/en.json';

const messages = {
    ...defaultMessages,
    ReviewSpecimens: {
        ...defaultMessages.ReviewSpecimens,
        abdomenStatusValues: {
            ...defaultMessages.ReviewSpecimens.abdomenStatusValues,
            Gravid: 'Translated gravid',
            Unfed: 'Translated unfed',
        },
    },
};

function renderChangelog(changelog: SpecimenChangelog) {
    return render(
        <NextIntlClientProvider locale="en" timeZone="UTC" messages={messages}>
            <SpecimenChangelogDrawer
                changelog={changelog}
                siteDisplayName="AD 70"
            />
        </NextIntlClientProvider>,
    );
}

test('renders mixed history newest-first with specimen labels and raw ID values', async () => {
    renderChangelog({
        specimenId: 'Gravid',
        sessionId: 1401,
        siteId: 89,
        timezone: 'UTC',
        edits: [
            {
                id: 1,
                scope: 'image',
                reviewerName: 'Image reviewer',
                createdAt: 1000,
                imageNumber: 1,
                changes: [
                    {
                        field: 'abdomenStatus',
                        previousValue: 'Gravid',
                        value: 'Unfed',
                    },
                ],
            },
            {
                id: 2,
                scope: 'specimen',
                reviewerName: null,
                createdAt: 1000,
                imageNumber: null,
                changes: [
                    {
                        field: 'specimenId',
                        previousValue: 'Gravid',
                        value: 'Unfed',
                    },
                ],
            },
            {
                id: 3,
                scope: 'specimen',
                reviewerName: 'Latest reviewer',
                createdAt: 1000,
                imageNumber: null,
                changes: [
                    {
                        field: 'specimenId',
                        previousValue: 'Unfed',
                        value: 'Gravid',
                    },
                ],
            },
        ],
    });
    await userEvent.setup().click(
        screen.getByRole('button', {
            name: 'View 3 review changes for specimen Gravid',
        }),
    );
    const dialog = within(screen.getByRole('dialog'));
    expect(
        dialog.getByRole('heading', { name: 'Review changes (3)' }),
    ).toBeInTheDocument();
    const entries = dialog.getAllByRole('listitem');
    expect(
        entries.map(entry => within(entry).getByRole('heading').textContent),
    ).toEqual(['Latest reviewer', 'Unknown reviewer', 'Image reviewer']);
    expect(dialog.getAllByText('Specimen details')).toHaveLength(2);
    expect(dialog.queryByText('Image unavailable')).not.toBeInTheDocument();
    expect(dialog.getByText('Image 1')).toBeInTheDocument();
    const newest = within(entries[0]!).getByRole('definition');
    expect(newest.firstElementChild).toHaveTextContent(/^Unfed$/);
    expect(newest.lastElementChild).toHaveTextContent(/^Gravid$/);
    expect(dialog.getByText('Translated gravid')).toBeInTheDocument();
    expect(dialog.getByText('Translated unfed')).toBeInTheDocument();
});

test.each([undefined, 123])(
    'retains prediction fallback labels for image ID %s',
    async imageId => {
        renderChangelog({
            specimenId: 'CMS007',
            sessionId: 1401,
            siteId: 89,
            timezone: 'UTC',
            edits: [
                {
                    id: 1,
                    scope: 'image',
                    reviewerName: null,
                    createdAt: 1000,
                    imageNumber: null,
                    imageId,
                    changes: [],
                },
            ],
        });
        await userEvent.setup().click(screen.getByRole('button'));
        expect(
            screen.getByText(
                imageId === undefined ? 'Image unavailable' : 'Image ID 123',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(messages.SpecimenChangelog.unavailableChanges),
        ).toBeInTheDocument();
    },
);

test.each([
    ['Gravid', '', 'Translated gravid', '—'],
    ['', 'Unfed', '—', 'Translated unfed'],
    ['', '', '—', '—'],
    [null, null, '—', '—'],
    ['Unfed', 'Gravid', 'Translated unfed', 'Translated gravid'],
] as const)(
    'displays empty and populated change values: %s to %s',
    async (previousValue, value, expectedPreviousValue, expectedValue) => {
        const changelog: SpecimenChangelog = {
            specimenId: 'CMS007',
            sessionId: 1401,
            siteId: 89,
            timezone: 'UTC',
            edits: [
                {
                    id: 1,
                    scope: 'image',
                    reviewerName: 'Reviewer',
                    createdAt: 1000,
                    imageNumber: 1,
                    changes: [{ field: 'abdomenStatus', previousValue, value }],
                },
            ],
        };
        renderChangelog(changelog);
        await userEvent.setup().click(screen.getByRole('button'));
        expect(screen.getByRole('dialog')).toHaveAccessibleDescription(
            'Session 1401 · AD 70',
        );
        const definition = within(screen.getByRole('dialog')).getByRole(
            'definition',
        );
        expect(definition.firstElementChild).toHaveTextContent(
            expectedPreviousValue,
        );
        expect(definition.lastElementChild).toHaveTextContent(expectedValue);
    },
);
