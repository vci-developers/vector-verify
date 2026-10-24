import { expect, test } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import { formKeys } from '@/api/form/form-keys';
import { formAnswerKeys } from '@/api/form-answer/form-answer-keys';
import { sessionKeys } from '@/api/session/session-keys';
import { sessionSchema } from '@/api/session/validation/session-schema';
import type { GetAllSessionsQueryParams } from '@/api/session/validation/get-all-sessions-schema';
import { ok } from '@/lib/result/result';
import { TooltipProvider } from '@/components/ui/tooltip';
import SpecimenReviewLink from '@/features/review/specimens-table/components/specimen-review-link';
import messages from '../../../../../messages/en.json';
import { createTestQueryClient } from '../../../../helpers/create-query-client';

const session = sessionSchema.parse({
    sessionId: 1,
    frontendId: 'session-1',
    collectorName: 'Collector',
    collectorTitle: 'Officer',
    collectionDate: Date.parse('2024-02-29T23:30:00Z'),
    collectionMethod: 'Trap',
    specimenCondition: '',
    createdAt: 0,
    completedAt: null,
    submittedAt: 0,
    notes: '',
    siteId: 89,
    deviceId: 1,
    type: 'SURVEILLANCE',
    state: 'CERTIFIED',
    latitude: null,
    longitude: null,
    collectionCycleId: 7,
});

function renderReviewLink(
    props: ComponentProps<typeof SpecimenReviewLink>,
    expectedSessionQuery: GetAllSessionsQueryParams,
) {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
        formKeys.currentFormByProgramId(props.programId),
        ok({ questions: [] }),
    );
    queryClient.setQueryData(
        formAnswerKeys.formAnswersBySessionId(props.session.sessionId),
        ok({ answers: [] }),
    );
    queryClient.setQueryData(
        sessionKeys.allSessions(expectedSessionQuery),
        ok({ message: '', sessions: [props.session] }),
    );
    render(
        <QueryClientProvider client={queryClient}>
            <NextIntlClientProvider
                locale="en"
                timeZone="UTC"
                messages={messages}
            >
                <TooltipProvider delayDuration={0}>
                    <SpecimenReviewLink {...props} />
                </TooltipProvider>
            </NextIntlClientProvider>
        </QueryClientProvider>,
    );
}

function getReviewUrl() {
    const reviewLink = screen.getByRole('link', {
        name: messages.ReviewSpecimens.review,
    });
    expect(reviewLink).toHaveAttribute('href');
    return new URL(
        reviewLink.getAttribute('href') ?? '',
        'https://example.test',
    );
}

test('preserves the cycle, specimen and timezone when linking to image review', () => {
    renderReviewLink(
        {
            session,
            programId: 1,
            specimenId: 42,
            hasCollectionCycles: true,
            timezone: 'Africa/Kampala',
        },
        {
            siteIds: [89],
            collectionCycleId: 7,
            type: 'SURVEILLANCE',
        },
    );
    const reviewUrl = getReviewUrl();
    expect(reviewUrl.pathname).toBe('/review/89');
    expect(reviewUrl.searchParams.get('collectionCycleId')).toBe('7');
    expect(reviewUrl.searchParams.get('specimenId')).toBe('42');
    expect(reviewUrl.searchParams.get('step')).toBe('images');
    expect(reviewUrl.searchParams.get('timezone')).toBe('Africa/Kampala');
    expect(reviewUrl.searchParams.has('startDate')).toBe(false);
    expect(reviewUrl.searchParams.has('endDate')).toBe(false);
});

test('scopes cycle-less sessions to their UTC calendar month, including leap years', () => {
    renderReviewLink(
        {
            session: { ...session, collectionCycleId: null },
            programId: 1,
            specimenId: 42,
            hasCollectionCycles: false,
        },
        {
            siteIds: [89],
            startDate: '2024-02-01',
            endDate: '2024-02-29',
            type: 'SURVEILLANCE',
        },
    );
    const reviewUrl = getReviewUrl();
    expect(reviewUrl.searchParams.get('startDate')).toBe('2024-02-01');
    expect(reviewUrl.searchParams.get('endDate')).toBe('2024-02-29');
    expect(reviewUrl.searchParams.has('collectionCycleId')).toBe(false);
    expect(reviewUrl.searchParams.has('timezone')).toBe(false);
    expect(reviewUrl.searchParams.get('specimenId')).toBe('42');
    expect(reviewUrl.searchParams.get('step')).toBe('images');
});

test('keeps unassigned sessions disabled and explains why on keyboard focus', async () => {
    const user = userEvent.setup();
    renderReviewLink(
        {
            session: { ...session, collectionCycleId: null },
            programId: 1,
            specimenId: 42,
            hasCollectionCycles: true,
        },
        {
            siteIds: [89],
            startDate: '2024-02-01',
            endDate: '2024-02-29',
            type: 'SURVEILLANCE',
        },
    );
    expect(
        screen.getByRole('button', { name: messages.ReviewSpecimens.review }),
    ).toBeDisabled();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
        messages.ReviewSpecimens.missingCycle,
    );
});
