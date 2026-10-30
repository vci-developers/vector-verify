import { expect, test } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { specimenChangelogSchema } from '@/features/review/specimens-table/validation/specimen-changelog-schema';
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

test.each([
    ['Gravid', '', 'Translated gravid', '—'],
    ['', 'Unfed', '—', 'Translated unfed'],
    ['', '', '—', '—'],
    [null, null, '—', '—'],
    ['Unfed', 'Gravid', 'Translated unfed', 'Translated gravid'],
] as const)(
    'displays empty and populated change values: %s to %s',
    async (previousValue, value, expectedPreviousValue, expectedValue) => {
        const changelog = specimenChangelogSchema.parse({
            specimenId: 'CMS007',
            sessionId: 1401,
            siteId: 89,
            timezone: 'UTC',
            edits: [
                {
                    id: 1,
                    reviewerName: 'Reviewer',
                    createdAt: 1000,
                    imageNumber: 1,
                    changes: [{ field: 'abdomenStatus', previousValue, value }],
                },
            ],
        });
        render(
            <NextIntlClientProvider
                locale="en"
                timeZone="UTC"
                messages={messages}
            >
                <SpecimenChangelogDrawer
                    changelog={changelog}
                    siteDisplayName="AD 70"
                />
            </NextIntlClientProvider>,
        );
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
