import { afterEach, describe, expect, test, vi } from 'vitest';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import ReviewWorkspacePageClient from '@/features/review/workspace/components/review-workspace-page-client';
import { err, ok } from '@/lib/result/result';
import { createTestQueryClient } from '../../../../helpers/create-query-client';
import messages from '../../../../../messages/en.json';
import { kenyaProgramFixture } from '../metadata/fixtures/program-fixtures';

vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(),
    useRouter: () => ({ push: vi.fn() }),
}));

const USER_PROGRAM_ID = kenyaProgramFixture.form?.programId ?? 10;
const SITE_ID = kenyaProgramFixture.sessions[0]?.siteId ?? 0;

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status });
}

function stubWorkspaceApi({ isKenyaUser }: { isKenyaUser: boolean }) {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (input: RequestInfo | URL) => {
            const path = String(input);
            const sessionId = Number(/sessions\/(\d+)/.exec(path)?.[1]);
            if (path.startsWith('/api/users/permissions')) {
                return jsonResponse(
                    ok({
                        message: 'OK',
                        programId: USER_PROGRAM_ID,
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
            if (path.startsWith('/api/programs?')) {
                return jsonResponse(
                    ok({
                        programs: isKenyaUser
                            ? [
                                  {
                                      programId: USER_PROGRAM_ID,
                                      name: 'Kenya ANOSTEP',
                                      country: 'Kenya',
                                  },
                              ]
                            : [],
                    }),
                );
            }
            if (path.startsWith('/api/sessions/all')) {
                return jsonResponse(
                    ok({
                        message: 'OK',
                        sessions: kenyaProgramFixture.sessions,
                    }),
                );
            }
            if (path.endsWith('/forms/current')) {
                return jsonResponse(ok(kenyaProgramFixture.form));
            }
            if (path.includes('/forms/answers')) {
                return jsonResponse(
                    ok(
                        kenyaProgramFixture.formAnswersBySessionId.get(
                            sessionId,
                        ),
                    ),
                );
            }
            if (path.includes('/survey')) {
                return jsonResponse(
                    ok(
                        kenyaProgramFixture.surveillanceFormBySessionId.get(
                            sessionId,
                        ),
                    ),
                );
            }
            return jsonResponse(err({ kind: 'not_found', status: 404 }), 404);
        }),
    );
}

function renderWorkspace() {
    render(
        <QueryClientProvider client={createTestQueryClient()}>
            <NextIntlClientProvider locale="en" messages={messages}>
                <ReviewWorkspacePageClient siteId={SITE_ID} />
            </NextIntlClientProvider>
        </QueryClientProvider>,
    );
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('ReviewWorkspacePageClient read-only', () => {
    test('Kenya user gets a read-only workspace without certification', async () => {
        stubWorkspaceApi({ isKenyaUser: true });
        renderWorkspace();

        expect(
            await screen.findByRole('button', {
                name: 'Continue to Image Review',
            }),
        ).toBeInTheDocument();
        expect(screen.getByText('Metadata Review')).toBeInTheDocument();
        expect(screen.getByText('Image Review')).toBeInTheDocument();
        expect(screen.queryByText('Certification')).not.toBeInTheDocument();
        expect(screen.queryByText('Value')).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Save & Continue' }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText('This review is read-only.'),
        ).toBeInTheDocument();
    });

    test('non-Kenya user keeps an editable workspace with certification', async () => {
        stubWorkspaceApi({ isKenyaUser: false });
        renderWorkspace();

        expect(
            await screen.findByRole('button', { name: 'Save & Continue' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Value')).toBeInTheDocument();
        expect(screen.getByText('Certification')).toBeInTheDocument();
        expect(
            screen.queryByText('This review is read-only.'),
        ).not.toBeInTheDocument();
    });
});
