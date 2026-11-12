import { afterEach, describe, expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useReviewAccess } from '@/features/review/hooks/use-review-access';
import { err, ok } from '@/lib/result/result';
import { createTestQueryClient } from '../../../helpers/create-query-client';

const KENYA_PROGRAM_ID = 10;
const UGANDA_PROGRAM_ID = 7;
const UNKNOWN_PROGRAM_ID = 99;

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status });
}

function stubApi({
    userProgramId,
    programsFail = false,
}: {
    userProgramId: number;
    programsFail?: boolean;
}) {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (input: RequestInfo | URL) => {
            const path = String(input);
            if (path.startsWith('/api/users/permissions')) {
                return jsonResponse(
                    ok({
                        message: 'OK',
                        programId: userProgramId,
                        permissions: {
                            devMode: false,
                            sites: {
                                viewSiteMetadata: true,
                                writeSiteMetadata: true,
                                pushSiteMetadata: true,
                                canAccessSites: [],
                            },
                            annotations: { viewAndWriteAnnotationTasks: true },
                        },
                    }),
                );
            }
            if (programsFail) {
                return jsonResponse(err({ kind: 'server', status: 500 }), 500);
            }
            return jsonResponse(
                ok({
                    programs: [
                        {
                            programId: KENYA_PROGRAM_ID,
                            name: 'Kenya ANOSTEP',
                            country: 'Kenya',
                        },
                        {
                            programId: UGANDA_PROGRAM_ID,
                            name: 'National Malaria Elimination Division',
                            country: 'Uganda',
                        },
                    ],
                }),
            );
        }),
    );
}

function renderReviewAccess() {
    const queryClient = createTestQueryClient();
    function wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    }
    const rendered = renderHook(() => useReviewAccess(), { wrapper });
    async function waitForSettled() {
        await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    }
    return { ...rendered, waitForSettled };
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('useReviewAccess', () => {
    test('is loading before the requests settle', () => {
        stubApi({ userProgramId: KENYA_PROGRAM_ID });
        const { result } = renderReviewAccess();

        expect(result.current).toBe('loading');
    });

    test('is read-only for a Kenya program user', async () => {
        stubApi({ userProgramId: KENYA_PROGRAM_ID });
        const { result, waitForSettled } = renderReviewAccess();

        await waitForSettled();
        expect(result.current).toBe('read-only');
    });

    test('is writable for a non-Kenya program user', async () => {
        stubApi({ userProgramId: UGANDA_PROGRAM_ID });
        const { result, waitForSettled } = renderReviewAccess();

        await waitForSettled();
        expect(result.current).toBe('writable');
    });

    test('is error when the programs request fails', async () => {
        stubApi({ userProgramId: UGANDA_PROGRAM_ID, programsFail: true });
        const { result, waitForSettled } = renderReviewAccess();

        await waitForSettled();
        expect(result.current).toBe('error');
    });

    test("is error when the user's program is missing", async () => {
        stubApi({ userProgramId: UNKNOWN_PROGRAM_ID });
        const { result, waitForSettled } = renderReviewAccess();

        await waitForSettled();
        expect(result.current).toBe('error');
    });
});
