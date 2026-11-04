import { afterEach, expect, test, vi } from 'vitest';
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClientProvider } from '@tanstack/react-query';
import { sessionSchema } from '@/api/session/validation/session-schema';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';
import { collectionCycleSchema } from '@/api/collection-cycle/validation/collection-cycle-schema';
import { siteSchema } from '@/api/site/validation/site-schema';
import { reviewLogKeys } from '@/api/review-log/review-log-keys';
import { specimenKeys } from '@/api/specimen/specimen-keys';
import { createReviewLog } from '../../../../helpers/create-review-log';
import { ok, err } from '@/lib/result/result';
import SpecimensTable from '@/features/review/specimens-table/components/specimens-table';
import * as reviewLogGrouping from '@/features/review/specimens-table/utils/group-review-logs-by-specimen-id';
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
    createReviewLog({ id: 1, specimenId: 7, createdAt: 1000 }),
    createReviewLog({ id: 2, fields: { specimenId: 7 }, createdAt: 2000 }),
    createReviewLog({
        id: 3,
        specimenId: 8,
        fields: { specimenId: 7 },
        createdAt: 3000,
    }),
    createReviewLog({ id: 4, specimenId: 100, createdAt: 4000 }),
    createReviewLog({
        id: 5,
        fields: { specimenId: 'CMS007' },
        createdAt: 5000,
    }),
];

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

function renderTable({
    empty = false,
    failed = false,
    pending = false,
    missingSession = false,
    total = 60,
    queryClient = createTestQueryClient(),
} = {}) {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input), 'https://example.test');
        if (url.pathname === '/api/specimens') {
            return Response.json(
                ok({
                    specimens: empty
                        ? []
                        : url.searchParams.get('sortOrder') === 'desc'
                          ? [...specimens].reverse()
                          : specimens,
                    total: empty ? 0 : total,
                    limit: 20,
                    offset: Number(url.searchParams.get('offset') ?? 0),
                    hasMore:
                        !empty &&
                        Number(url.searchParams.get('offset') ?? 0) + 20 <
                            total,
                }),
            );
        }
        if (url.pathname === '/api/sessions/all') {
            return Response.json(
                ok({ message: '', sessions: missingSession ? [] : [session] }),
            );
        }
        if (url.pathname === '/api/sessions/review/logs/all') {
            if (pending) return new Promise<Response>(() => {});
            return Response.json(
                failed
                    ? err({ kind: 'server', message: 'Failed' })
                    : ok({ message: '', logs }),
            );
        }
        throw new Error(`Unexpected request: ${url.pathname}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    render(
        <QueryClientProvider client={queryClient}>
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
                    collectionCycles={[
                        collectionCycleSchema.parse({
                            id: 7,
                            programId: 1,
                            collectionScheduleId: 1,
                            cycleNumber: 8,
                            startDate: Date.parse('2026-10-01T00:00:00Z'),
                            endDate: Date.parse('2026-10-31T00:00:00Z'),
                            timezone: 'UTC',
                            createdAt: 0,
                            updatedAt: 0,
                        }),
                    ]}
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

test('debounces typing and clearing while resetting pagination with the search query', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryDefaults(specimenKeys.root, { staleTime: 0 });
    const fetchMock = renderTable({ queryClient });
    await screen.findByText('CMS007');
    await userEvent
        .setup()
        .click(screen.getByRole('link', { name: 'Go to page 2' }));
    await screen.findByText('Page 2 of 3');
    vi.useFakeTimers();
    const search = screen.getByRole('textbox', {
        name: messages.ReviewSpecimens.search,
    });
    fetchMock.mockClear();
    fireEvent.change(search, { target: { value: 'CMS' } });
    await act(() => vi.advanceTimersByTimeAsync(200));
    fireEvent.change(search, { target: { value: 'CMS007' } });
    expect(search).toHaveValue('CMS007');
    await act(() => vi.advanceTimersByTimeAsync(299));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(1));
    const searchRequests = fetchMock.mock.calls.map(
        ([input]) => new URL(String(input), 'https://example.test'),
    );
    expect(searchRequests).toHaveLength(1);
    expect(searchRequests[0]?.searchParams.get('specimenId')).toBe('CMS007');
    expect(searchRequests[0]?.searchParams.get('offset')).toBe('0');

    fetchMock.mockClear();
    fireEvent.change(
        screen.getByRole('textbox', { name: messages.ReviewSpecimens.search }),
        { target: { value: '' } },
    );
    expect(
        screen.getByRole('textbox', { name: messages.ReviewSpecimens.search }),
    ).toHaveValue('');
    await act(() => vi.advanceTimersByTimeAsync(299));
    expect(fetchMock).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    const clearedRequests = fetchMock.mock.calls.map(
        ([input]) => new URL(String(input), 'https://example.test'),
    );
    expect(clearedRequests).toHaveLength(1);
    expect(clearedRequests[0]?.searchParams.has('specimenId')).toBe(false);
    expect(clearedRequests[0]?.searchParams.get('offset')).toBe('0');
});

test('reuses grouped logs while typing and regroups when log data changes', async () => {
    const groupLogs = vi.spyOn(
        reviewLogGrouping,
        'groupReviewLogsBySpecimenId',
    );
    const queryClient = createTestQueryClient();
    renderTable({ queryClient });
    await screen.findByRole('button', { name: /CMS007.*2|2.*CMS007/ });
    groupLogs.mockClear();
    fireEvent.change(
        screen.getByRole('textbox', { name: messages.ReviewSpecimens.search }),
        { target: { value: 'CMS' } },
    );
    expect(groupLogs).not.toHaveBeenCalled();

    act(() => {
        queryClient.setQueriesData(
            { queryKey: reviewLogKeys.root },
            ok({
                message: '',
                logs: [...logs, createReviewLog({ id: 6, specimenId: 7 })],
            }),
        );
    });
    await screen.findByRole('button', { name: /CMS007.*3|3.*CMS007/ });
    expect(groupLogs).toHaveBeenCalledTimes(1);
});

test('cancels a pending search when the table unmounts', async () => {
    const fetchMock = renderTable();
    await screen.findByText('CMS007');
    vi.useFakeTimers();
    fireEvent.change(
        screen.getByRole('textbox', { name: messages.ReviewSpecimens.search }),
        { target: { value: 'CMS007' } },
    );
    cleanup();
    fetchMock.mockClear();
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(fetchMock).not.toHaveBeenCalled();
});

test('refreshes the shared log cache after a prediction edit when returning within its fresh-cache window', async () => {
    const queryClient = createTestQueryClient();
    const logQueryKey = reviewLogKeys.allReviewLogs({
        siteId: 89,
        collectionCycleId: 7,
        action: 'update_specimen_image_prediction',
        hasChanges: 'true',
    });
    queryClient.setQueryDefaults(logQueryKey, { staleTime: 60_000 });
    queryClient.setQueryData(logQueryKey, ok({ message: '', logs: [] }));
    const initialFetch = renderTable({ queryClient });
    expect(
        await screen.findAllByText(messages.SpecimenChangelog.noChanges),
    ).toHaveLength(3);
    expect(
        initialFetch.mock.calls.filter(([url]) =>
            String(url).includes('/review/logs/all'),
        ),
    ).toHaveLength(0);

    cleanup();
    await queryClient.invalidateQueries({ queryKey: reviewLogKeys.root });
    expect(queryClient.getQueryState(logQueryKey)?.isInvalidated).toBe(true);
    const returnFetch = renderTable({ queryClient });
    expect(
        await screen.findByRole('button', { name: /CMS007.*2|2.*CMS007/ }),
    ).toBeInTheDocument();
    expect(
        returnFetch.mock.calls.filter(([url]) =>
            String(url).includes('/review/logs/all'),
        ),
    ).toHaveLength(1);
    expect(queryClient.getQueryData(logQueryKey)).toEqual(
        ok({ message: '', logs }),
    );
});

test('keeps rows visible without review links when the session lookup has no match', async () => {
    renderTable({ missingSession: true });
    await screen.findByText('CMS007');
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(3);
    for (const row of rows) {
        expect(within(row).getByText('1401')).toBeInTheDocument();
        expect(within(row).queryByRole('link')).not.toBeInTheDocument();
        expect(
            within(row).getAllByText(messages.ReviewSpecimens.accessError),
        ).toHaveLength(2);
    }
});

test('shows cycle numbers and default filter labels', async () => {
    renderTable();
    expect(await screen.findAllByText('Cycle 8')).toHaveLength(3);
    expect(screen.getAllByRole('link', { name: '1401' })).toHaveLength(3);
    for (const field of ['species', 'sex', 'abdomenStatus'] as const) {
        expect(
            screen.getByRole('combobox', {
                name: messages.ReviewSpecimens[field],
            }),
        ).toHaveTextContent(messages.ReviewSpecimens.allFilters[field]);
    }
});

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

test('sorts the specimen column through the backend and supports ascending, descending, and off', async () => {
    const fetchMock = renderTable();
    const user = userEvent.setup();
    await screen.findByText('CMS007');
    expect(
        screen.getByRole('columnheader', { name: 'Specimen' }),
    ).toHaveAttribute('aria-sort', 'none');
    for (const header of screen.getAllByRole('columnheader')) {
        if (header.textContent !== 'Specimen')
            expect(
                within(header).queryByRole('button'),
            ).not.toBeInTheDocument();
    }
    const initialRequest = fetchMock.mock.calls.find(
        ([input]) =>
            new URL(String(input), 'https://example.test').pathname ===
            '/api/specimens',
    );
    const initialUrl = new URL(
        String(initialRequest?.[0]),
        'https://example.test',
    );
    expect(initialUrl.searchParams.has('sortBy')).toBe(false);
    expect(initialUrl.searchParams.has('sortOrder')).toBe(false);

    screen.getByRole('button', { name: 'Specimen' }).focus();
    await user.keyboard('{Enter}');
    await waitFor(() =>
        expect(
            fetchMock.mock.calls.some(([input]) => {
                const url = new URL(String(input), 'https://example.test');
                return (
                    url.searchParams.get('sortBy') === 'specimenId' &&
                    url.searchParams.get('sortOrder') === 'asc'
                );
            }),
        ).toBe(true),
    );
    expect(
        await screen.findByRole('columnheader', { name: 'Specimen' }),
    ).toHaveAttribute('aria-sort', 'ascending');

    await user.click(screen.getByRole('button', { name: 'Specimen' }));
    await waitFor(() =>
        expect(
            screen.getByRole('columnheader', { name: 'Specimen' }),
        ).toHaveAttribute('aria-sort', 'descending'),
    );
    expect(
        screen
            .getAllByRole('row')
            .slice(1)
            .map(row => within(row).getAllByRole('cell')[1]?.textContent),
    ).toEqual(['CMS009', 'CMS008', 'CMS007']);
    expect(
        fetchMock.mock.calls.some(([input]) => {
            const url = new URL(String(input), 'https://example.test');
            return (
                url.searchParams.get('sortBy') === 'specimenId' &&
                url.searchParams.get('sortOrder') === 'desc'
            );
        }),
    ).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Specimen' }));
    expect(
        await screen.findByRole('columnheader', { name: 'Specimen' }),
    ).toHaveAttribute('aria-sort', 'none');
    expect(
        screen
            .getAllByRole('row')
            .slice(1)
            .map(row => within(row).getAllByRole('cell')[1]?.textContent),
    ).toEqual(['CMS007', 'CMS008', 'CMS009']);
});

test('resets pagination on sorting and preserves the server sort across pages and filters', async () => {
    const fetchMock = renderTable();
    const user = userEvent.setup();
    await screen.findByText('CMS007');
    await user.click(
        screen.getByRole('button', { name: messages.ReviewSpecimens.next }),
    );
    await waitFor(() =>
        expect(
            screen.getByRole('button', {
                name: messages.ReviewSpecimens.previous,
            }),
        ).toBeEnabled(),
    );
    await user.click(screen.getByRole('button', { name: 'Specimen' }));
    await waitFor(() =>
        expect(
            fetchMock.mock.calls.some(([input]) => {
                const url = new URL(String(input), 'https://example.test');
                return (
                    url.searchParams.get('sortBy') === 'specimenId' &&
                    url.searchParams.get('sortOrder') === 'asc' &&
                    url.searchParams.get('offset') === '0'
                );
            }),
        ).toBe(true),
    );
    expect(
        await screen.findByRole('button', {
            name: messages.ReviewSpecimens.previous,
        }),
    ).toBeDisabled();
    await user.click(
        screen.getByRole('button', { name: messages.ReviewSpecimens.next }),
    );
    await waitFor(() =>
        expect(
            fetchMock.mock.calls.some(([input]) => {
                const url = new URL(String(input), 'https://example.test');
                return (
                    url.searchParams.get('sortBy') === 'specimenId' &&
                    url.searchParams.get('sortOrder') === 'asc' &&
                    url.searchParams.get('offset') === '20'
                );
            }),
        ).toBe(true),
    );
    await user.click(
        screen.getByRole('combobox', { name: messages.ReviewSpecimens.sex }),
    );
    await user.type(
        screen.getByPlaceholderText(messages.ReviewSpecimens.filterSearch.sex),
        'Female',
    );
    await user.click(screen.getByRole('option', { name: 'Female' }));
    await waitFor(() =>
        expect(
            fetchMock.mock.calls.some(([input]) => {
                const url = new URL(String(input), 'https://example.test');
                return (
                    url.pathname === '/api/specimens' &&
                    url.searchParams.get('sex') === 'Female' &&
                    url.searchParams.get('sortBy') === 'specimenId' &&
                    url.searchParams.get('sortOrder') === 'asc' &&
                    url.searchParams.get('offset') === '0'
                );
            }),
        ).toBe(true),
    );
    expect(
        await screen.findByRole('columnheader', { name: 'Specimen' }),
    ).toHaveAttribute('aria-sort', 'ascending');
    expect(
        fetchMock.mock.calls.filter(([url]) =>
            String(url).includes('/review/logs/all'),
        ),
    ).toHaveLength(1);
});

test('supports direct page links, keyboard navigation, and disabled first/last controls', async () => {
    const fetchMock = renderTable();
    const user = userEvent.setup();
    expect(await screen.findByText('Page 1 of 3')).toBeInTheDocument();
    expect(
        screen.getByRole('button', { name: messages.ReviewSpecimens.previous }),
    ).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Go to page 1' })).toHaveAttribute(
        'aria-current',
        'page',
    );
    await user.click(screen.getByRole('link', { name: 'Go to page 3' }));
    expect(await screen.findByText('Page 3 of 3')).toBeInTheDocument();
    expect(
        fetchMock.mock.calls.some(
            ([input]) =>
                new URL(String(input), 'https://example.test').searchParams.get(
                    'offset',
                ) === '40',
        ),
    ).toBe(true);
    const next = screen.getByRole('button', {
        name: messages.ReviewSpecimens.next,
    });
    expect(next).toBeDisabled();
    const requestCount = fetchMock.mock.calls.length;
    await user.click(next);
    expect(fetchMock).toHaveBeenCalledTimes(requestCount);
    screen.getByRole('link', { name: 'Go to page 2' }).focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to page 2' })).toHaveAttribute(
        'aria-current',
        'page',
    );
    expect(
        fetchMock.mock.calls.some(
            ([input]) =>
                new URL(String(input), 'https://example.test').searchParams.get(
                    'offset',
                ) === '20',
        ),
    ).toBe(true);
    await user.click(
        screen.getByRole('button', { name: messages.ReviewSpecimens.previous }),
    );
    expect(await screen.findByText('Page 1 of 3')).toBeInTheDocument();
    expect(
        fetchMock.mock.calls.filter(([url]) =>
            String(url).includes('/review/logs/all'),
        ),
    ).toHaveLength(1);
});

test('uses ellipses for large page counts and updates neighboring page links', async () => {
    const fetchMock = renderTable({ total: 400 });
    const user = userEvent.setup();
    expect(await screen.findByText('Page 1 of 20')).toBeInTheDocument();
    const pagination = screen.getByRole('navigation', {
        name: messages.ReviewSpecimens.paginationLabel,
    });
    expect(
        pagination.querySelector('[data-slot="pagination-ellipsis"]'),
    ).toBeInTheDocument();
    expect(within(pagination).getAllByRole('link').length).toBeLessThanOrEqual(
        7,
    );
    await user.click(screen.getByRole('link', { name: 'Go to page 20' }));
    expect(await screen.findByText('Page 20 of 20')).toBeInTheDocument();
    expect(
        screen.getByRole('link', { name: 'Go to page 19' }),
    ).toBeInTheDocument();
    expect(
        fetchMock.mock.calls.some(
            ([input]) =>
                new URL(String(input), 'https://example.test').searchParams.get(
                    'offset',
                ) === '380',
        ),
    ).toBe(true);
});

test.each([false, true])(
    'handles single-page and empty results without invalid page navigation: empty=%s',
    async empty => {
        renderTable({ empty, total: 3 });
        expect(await screen.findByText('Page 1 of 1')).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: messages.ReviewSpecimens.previous,
            }),
        ).toBeDisabled();
        expect(
            screen.getByRole('button', { name: messages.ReviewSpecimens.next }),
        ).toBeDisabled();
        expect(
            screen.getByRole('link', { name: 'Go to page 1' }),
        ).toHaveAttribute('aria-current', 'page');
        expect(
            screen.queryByRole('link', { name: 'Go to page 2' }),
        ).not.toBeInTheDocument();
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
