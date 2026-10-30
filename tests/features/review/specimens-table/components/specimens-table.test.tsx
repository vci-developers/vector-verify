import { afterEach, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClientProvider } from '@tanstack/react-query';
import { sessionSchema } from '@/api/session/validation/session-schema';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';
import { siteSchema } from '@/api/site/validation/site-schema';
import { reviewLogSchema } from '@/api/session/validation/get-review-logs-schema';
import { ok, err } from '@/lib/result/result';
import SpecimensTable from '@/features/review/specimens-table/components/specimens-table';
import messages from '../../../../../messages/en.json';
import { createTestQueryClient } from '../../../../helpers/create-query-client';

const session = sessionSchema.parse({
    sessionId: 1401,
    frontendId: 'session-1401',
    collectorName: 'Collector',
    collectorTitle: 'Officer',
    collectionDate: 0,
    collectionMethod: 'Trap',
    specimenCondition: '',
    createdAt: 0,
    completedAt: null,
    submittedAt: 0,
    notes: '',
    siteId: 89,
    deviceId: 1,
    type: 'SURVEILLANCE',
    state: 'NEEDS_REVIEW',
    latitude: null,
    longitude: null,
    collectionCycleId: 7,
});
const specimens = [7, 8, 9].map(id =>
    specimenSchema.parse({
        id,
        specimenId: `CMS00${id}`,
        sessionId: session.sessionId,
        thumbnailUrl: null,
        thumbnailImageId: null,
        thumbnailImage: null,
        images: [],
    }),
);
const logs = [
    reviewLogSchema.parse({ id: 1, specimenId: 7, createdAt: 1000 }),
    reviewLogSchema.parse({
        id: 2,
        fields: { specimenId: 7 },
        createdAt: 2000,
    }),
    reviewLogSchema.parse({
        id: 3,
        specimenId: 8,
        fields: { specimenId: 7 },
        createdAt: 3000,
    }),
    reviewLogSchema.parse({ id: 4, specimenId: 100, createdAt: 4000 }),
    reviewLogSchema.parse({
        id: 5,
        fields: { specimenId: 'CMS007' },
        createdAt: 5000,
    }),
];

afterEach(() => vi.unstubAllGlobals());

function renderTable({ empty = false, failed = false, pending = false } = {}) {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input), 'https://example.test');
        if (url.pathname === '/api/specimens') {
            return Response.json(
                ok({
                    specimens: empty ? [] : specimens,
                    total: 6,
                    limit: 20,
                    offset: 0,
                    hasMore: true,
                }),
            );
        }
        if (url.pathname === '/api/sessions/all') {
            return Response.json(ok({ message: '', sessions: [session] }));
        }
        if (url.pathname === '/api/sessions/review/logs/all') {
            if (pending) return new Promise<Response>(() => {});
            return Response.json(
                failed
                    ? err({ kind: 'server', message: 'Failed' })
                    : ok({ logs }),
            );
        }
        throw new Error(`Unexpected request: ${url.pathname}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    render(
        <QueryClientProvider client={createTestQueryClient()}>
            <NextIntlClientProvider
                locale="en"
                timeZone="UTC"
                messages={messages}
            >
                <SpecimensTable
                    programId={1}
                    sites={[
                        siteSchema.parse({
                            siteId: 90,
                            programId: 1,
                            locationHierarchy: { District: 'East' },
                            name: 'AD 70',
                            isActive: true,
                        }),
                    ]}
                    collectionCycles={[]}
                    selectedCycleIds={[7]}
                    locationQueryParam={{ siteId: 89 }}
                    startMonth={new Date('2026-10-01T00:00:00Z')}
                    endMonth={new Date('2026-10-01T00:00:00Z')}
                />
            </NextIntlClientProvider>
        </QueryClientProvider>,
    );
    return fetchMock;
}

test('fetches logs once for the table scope and groups numeric specimen IDs including legacy fields', async () => {
    const fetchMock = renderTable();
    expect(
        await screen.findByRole('button', { name: /CMS007.*2|2.*CMS007/ }),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('button', { name: /CMS008.*1|1.*CMS008/ }),
    ).toBeInTheDocument();
    expect(
        screen.getByText(messages.SpecimenChangelog.noChanges),
    ).toBeInTheDocument();
    const logCalls = fetchMock.mock.calls.filter(([url]) =>
        String(url).includes('/review/logs/all'),
    );
    expect(logCalls).toHaveLength(1);
    const url = new URL(String(logCalls[0]?.[0]), 'https://example.test');
    expect(url.searchParams.get('siteId')).toBe('89');
    expect(url.searchParams.get('collectionCycleId')).toBe('7');
    expect(url.searchParams.get('action')).toBe(
        'update_specimen_image_prediction',
    );
    expect(url.searchParams.get('hasChanges')).toBe('true');
    expect(url.searchParams.has('specimenId')).toBe(false);

    await userEvent
        .setup()
        .click(
            screen.getByRole('button', { name: messages.ReviewSpecimens.next }),
        );
    await waitFor(() =>
        expect(
            fetchMock.mock.calls.some(([url]) =>
                String(url).includes('offset=20'),
            ),
        ).toBe(true),
    );
    expect(
        fetchMock.mock.calls.filter(([url]) =>
            String(url).includes('/review/logs/all'),
        ),
    ).toHaveLength(1);
});

test.each([
    {
        field: 'site',
        term: 'AD 70',
        label: 'AD 70',
        queryParam: 'siteId',
        value: '90',
    },
    {
        field: 'species',
        term: 'gambiae',
        label: 'Anopheles gambiae',
        queryParam: 'species',
        value: 'Anopheles gambiae',
    },
    {
        field: 'sex',
        term: 'Female',
        label: 'Female',
        queryParam: 'sex',
        value: 'Female',
    },
    {
        field: 'abdomenStatus',
        term: 'Gravid',
        label: 'Gravid',
        queryParam: 'abdomenStatus',
        value: 'Gravid',
    },
] as const)(
    'searching and selecting $field sends its backend value and resets pagination',
    async ({ field, term, label, queryParam, value }) => {
        const fetchMock = renderTable();
        const user = userEvent.setup();
        await screen.findByText('CMS007');
        await user.click(
            screen.getByRole('button', { name: messages.ReviewSpecimens.next }),
        );
        await waitFor(() =>
            expect(
                fetchMock.mock.calls.some(([url]) =>
                    String(url).includes('offset=20'),
                ),
            ).toBe(true),
        );
        await user.click(
            screen.getByRole('combobox', {
                name: messages.ReviewSpecimens[field],
            }),
        );
        await user.type(
            screen.getByPlaceholderText(
                messages.ReviewSpecimens.filterSearch[field],
            ),
            term,
        );
        await user.click(screen.getByRole('option', { name: label }));
        await waitFor(() =>
            expect(
                fetchMock.mock.calls.some(([input]) => {
                    const url = new URL(String(input), 'https://example.test');
                    return (
                        url.pathname === '/api/specimens' &&
                        url.searchParams.get(queryParam) === value &&
                        url.searchParams.get('offset') === '0'
                    );
                }),
            ).toBe(true),
        );
        expect(
            screen.getByRole('button', {
                name: messages.ReviewSpecimens.previous,
            }),
        ).toBeDisabled();
    },
);

test('does not fetch logs for an empty specimen list', async () => {
    const fetchMock = renderTable({ empty: true });
    expect(
        await screen.findByText(messages.ReviewSpecimens.empty),
    ).toBeInTheDocument();
    expect(
        fetchMock.mock.calls.filter(([url]) =>
            String(url).includes('/review/logs/all'),
        ),
    ).toHaveLength(0);
});

test('keeps specimen rows visible while shared logs are loading', async () => {
    renderTable({ pending: true });
    expect(await screen.findByText('CMS007')).toBeInTheDocument();
    expect(screen.getAllByText(messages.ReviewSpecimens.loading)).toHaveLength(
        3,
    );
    expect(
        screen.queryByText(messages.SpecimenChangelog.noChanges),
    ).not.toBeInTheDocument();
});

test('shows the shared log failure in each row without hiding specimens', async () => {
    renderTable({ failed: true });
    expect(await screen.findAllByRole('alert')).toHaveLength(3);
    expect(screen.getByText('CMS007')).toBeInTheDocument();
    for (const alert of screen.getAllByRole('alert')) {
        expect(alert).toHaveTextContent(messages.ReviewSpecimens.logsError);
    }
});
