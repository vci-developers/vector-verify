import { expect, test } from 'vitest';
import { createElement } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { formKeys } from '@/api/form/form-keys';
import { formSchema } from '@/api/form/validation/form-schema';
import { formAnswerKeys } from '@/api/form-answer/form-answer-keys';
import {
    sessionSchema,
    type Session,
} from '@/api/session/validation/session-schema';
import { ok } from '@/lib/result/result';
import { useReviewImageAccess } from '@/features/review/workspace/hooks/use-review-image-access';
import { createTestQueryClient } from '../../../../helpers/create-query-client';

const session = sessionSchema.parse({
    sessionId: 1,
    frontendId: 'session-1',
    collectorName: 'Collector',
    collectorTitle: 'Officer',
    collectionDate: Date.parse('2026-10-20T12:00:00Z'),
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

function createRequiredFormQueryClient() {
    const queryClient = createTestQueryClient();
    const form = formSchema.parse({
        id: 1,
        programId: 1,
        name: 'Current form',
        version: '2',
        createdAt: 0,
        updatedAt: 0,
        questions: [
            {
                id: 1,
                formId: 1,
                parentId: null,
                label: 'New required question',
                type: 'text',
                required: true,
                answerScope: 'SESSION',
                isUnitIdentityComponent: false,
                options: null,
                order: 1,
                prerequisite: null,
                createdAt: 0,
                updatedAt: 0,
            },
        ],
    });
    queryClient.setQueryData(formKeys.currentFormByProgramId(1), ok(form));
    queryClient.setQueryData(
        formAnswerKeys.formAnswersBySessionId(session.sessionId),
        ok({ answers: [] }),
    );
    return queryClient;
}

function renderImageAccess(
    sessions: Session[],
    queryClient: QueryClient,
    programId = 1,
) {
    return renderHook(() => useReviewImageAccess(sessions, programId), {
        wrapper: ({ children }) =>
            createElement(
                QueryClientProvider,
                { client: queryClient },
                children,
            ),
    });
}

for (const state of ['CERTIFIED', 'SUBMITTED'] as const) {
    test(`allows ${state} units with missing answers to current required questions`, () => {
        const { result } = renderImageAccess(
            [{ ...session, state }],
            createRequiredFormQueryClient(),
        );
        expect(result.current).toBe('allowed');
    });

    test(`allows ${state} units without waiting for metadata queries`, () => {
        const { result } = renderImageAccess(
            [{ ...session, state }],
            createTestQueryClient(),
        );
        expect(result.current).toBe('allowed');
    });
}

test('waits for program context before opening a read-only unit', () => {
    const { result } = renderImageAccess(
        [{ ...session, state: 'CERTIFIED' }],
        createTestQueryClient(),
        0,
    );
    expect(result.current).toBe('loading');
});

test('still blocks editable units with missing required answers', () => {
    const { result } = renderImageAccess(
        [session],
        createRequiredFormQueryClient(),
    );
    expect(result.current).toBe('blocked');
});

test('does not bypass metadata validation for partially reviewed units', () => {
    const queryClient = createRequiredFormQueryClient();
    queryClient.setQueryData(
        formAnswerKeys.formAnswersBySessionId(2),
        ok({ answers: [] }),
    );
    const { result } = renderImageAccess(
        [
            { ...session, state: 'CERTIFIED' },
            { ...session, sessionId: 2 },
        ],
        queryClient,
    );
    expect(result.current).toBe('blocked');
});

test('does not allow an empty review unit', () => {
    const { result } = renderImageAccess([], createTestQueryClient());
    expect(result.current).toBe('blocked');
});
