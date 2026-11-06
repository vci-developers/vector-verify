import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { resolveSessionConflictsRequestSchema } from '@/api/session/validation/resolve-session-conflicts-schema';
import type { ResolveSessionConflictsRequestBody } from '@/api/session/validation/resolve-session-conflicts-schema';
import MetadataReviewWorkspace from '@/features/review/workspace/metadata/components/metadata-review-workspace';
import { flattenQuestions } from '@/features/review/workspace/metadata/utils/metadata-section';
import { err, ok } from '@/lib/result/result';
import { createTestQueryClient } from '../../../../../helpers/create-query-client';
import messages from '../../../../../../messages/en.json';
import {
    kenyaProgramFixture,
    programFixtures,
    type ProgramFixture,
} from '../fixtures/program-fixtures';

beforeEach(() => {
    Element.prototype.hasPointerCapture = vi.fn(() => false);
});

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status });
}

function stubReviewApi(programFixture: ProgramFixture) {
    const resolveRequestBodies: ResolveSessionConflictsRequestBody[] = [];
    vi.stubGlobal(
        'fetch',
        vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
            const path = String(input);
            const sessionId = Number(/sessions\/(\d+)/.exec(path)?.[1]);
            if (path.endsWith('/forms/current')) {
                return programFixture.form
                    ? jsonResponse(ok(programFixture.form))
                    : jsonResponse(
                          err({ kind: 'not_found', status: 404 }),
                          404,
                      );
            }
            if (path.includes('/forms/answers')) {
                return jsonResponse(
                    ok(programFixture.formAnswersBySessionId.get(sessionId)),
                );
            }
            if (path.endsWith('/conflicts/resolve')) {
                resolveRequestBodies.push(JSON.parse(String(init?.body)));
                return jsonResponse(
                    ok({
                        message: 'Resolved',
                        resolutionId: 1,
                        updatedSessionCount: 1,
                    }),
                );
            }
            return jsonResponse(
                ok(programFixture.surveillanceFormBySessionId.get(sessionId)),
            );
        }),
    );
    return resolveRequestBodies;
}

function renderWorkspace(
    programFixture: ProgramFixture,
    sessions: ProgramFixture['sessions'],
) {
    const onGoToNextStep = vi.fn();
    render(
        <QueryClientProvider client={createTestQueryClient()}>
            <NextIntlClientProvider locale="en" messages={messages}>
                <MetadataReviewWorkspace
                    sessions={sessions}
                    programId={programFixture.form?.programId ?? 7}
                    timezone="Africa/Nairobi"
                    readOnly={false}
                    onGoToNextStep={onGoToNextStep}
                />
            </NextIntlClientProvider>
        </QueryClientProvider>,
    );
    return onGoToNextStep;
}

async function findRow(label: string) {
    const labelCells = await screen.findAllByText(label);
    const row = labelCells[0]?.closest('tr');
    if (!row) throw new Error(`No row for ${label}`);
    return row;
}

function findFlaggedRow() {
    return [...document.querySelectorAll('tbody tr')].find(row =>
        row.className.includes('bg-destructive'),
    ) as HTMLElement | undefined;
}

async function supplyFlaggedRow(flaggedRow: HTMLElement) {
    const control = within(flaggedRow).queryByRole('combobox');
    if (!control) {
        await userEvent.click(
            within(flaggedRow).getAllByRole('button')[0] as HTMLElement,
        );
        const selectableDay = screen
            .getAllByRole('gridcell')
            .flatMap(day => within(day).queryAllByRole('button'))
            .find(dayButton => !dayButton.hasAttribute('disabled'));
        await userEvent.click(selectableDay as HTMLElement);
        return;
    }
    await userEvent.click(control);
    const answerOption = screen
        .queryAllByRole('option')
        .find(option => option.textContent !== 'N/A');
    if (answerOption) {
        await userEvent.click(answerOption);
    } else {
        await userEvent.keyboard('1');
        await userEvent.click(
            await screen.findByRole('option', { name: 'Use "1"' }),
        );
    }
    if (control.getAttribute('aria-expanded') === 'true') {
        await userEvent.keyboard('{Escape}');
    }
}

async function supplyFlaggedRows() {
    await screen.findByText('Collector Name');
    for (let flaggedRow = findFlaggedRow(); flaggedRow; ) {
        await supplyFlaggedRow(flaggedRow);
        flaggedRow = findFlaggedRow();
    }
}

describe.each(programFixtures)('$program review', programFixture => {
    test('displays every session question without an error', async () => {
        stubReviewApi(programFixture);
        renderWorkspace(programFixture, programFixture.sessions);
        await screen.findByText('Collector Name');

        const sessionQuestions = flattenQuestions(
            programFixture.form?.questions ?? [],
        ).filter(question => question.answerScope === 'SESSION');
        for (const question of sessionQuestions) {
            expect(screen.getAllByText(question.label).length).toBeGreaterThan(
                0,
            );
        }
        expect(
            screen.queryByText(messages.ReviewMetadata.currentFormError),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(messages.ReviewMetadata.formAnswersError),
        ).not.toBeInTheDocument();
    });

    test(
        'resolves every flagged row and submits a valid request',
        { timeout: 30000 },
        async () => {
            const resolveRequestBodies = stubReviewApi(programFixture);
            const onGoToNextStep = renderWorkspace(
                programFixture,
                programFixture.sessions,
            );

            await supplyFlaggedRows();
            const saveButton = screen.getByRole('button', {
                name: 'Save & Continue',
            });
            await waitFor(() => expect(saveButton).toBeEnabled());
            await userEvent.click(saveButton);
            await waitFor(() => expect(onGoToNextStep).toHaveBeenCalled());

            expect(resolveRequestBodies.length).toBeGreaterThan(0);
            for (const requestBody of resolveRequestBodies) {
                expect(
                    resolveSessionConflictsRequestSchema.safeParse(requestBody)
                        .success,
                ).toBe(true);
            }
        },
    );
});

test(
    'saves an edited multi-select answer and its newly required cup ID',
    { timeout: 30000 },
    async () => {
        const resolveRequestBodies = stubReviewApi(kenyaProgramFixture);
        const onGoToNextStep = renderWorkspace(
            kenyaProgramFixture,
            kenyaProgramFixture.sessions.slice(1),
        );

        const collectionRow = await findRow(
            'Where is mosquito collection taking place?',
        );
        await userEvent.click(
            within(collectionRow).getByRole('button', { name: 'Edit value' }),
        );
        await userEvent.click(within(collectionRow).getByRole('combobox'));
        await userEvent.click(
            await screen.findByRole('option', { name: 'Animal Shelter' }),
        );
        await userEvent.keyboard('{Escape}');

        const saveButton = screen.getByRole('button', {
            name: 'Save & Continue',
            hidden: true,
        });
        expect(saveButton).toBeDisabled();

        const cupIdRow = await findRow('Scan cup ID for ANIMAL SHELTER');
        await userEvent.click(within(cupIdRow).getByRole('combobox'));
        await userEvent.keyboard('CUP-3');
        await userEvent.click(
            await screen.findByRole('option', { name: 'Use "CUP-3"' }),
        );

        await supplyFlaggedRows();
        await waitFor(() => expect(saveButton).toBeEnabled());
        await userEvent.click(saveButton);
        await waitFor(() => expect(onGoToNextStep).toHaveBeenCalled());

        const savedAnswers = resolveRequestBodies.flatMap(
            requestBody => requestBody.resolvedFormAnswers ?? [],
        );
        expect(savedAnswers).toContainEqual(
            expect.objectContaining({
                dataType: 'multi-select',
                value: expect.arrayContaining(['Animal Shelter']),
            }),
        );
        expect(savedAnswers).toContainEqual(
            expect.objectContaining({ dataType: 'qr', value: 'CUP-3' }),
        );
    },
);
