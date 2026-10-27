import { expect, test } from 'vitest';
import { sessionSchema } from '@/api/session/validation/session-schema';
import { formQuestionSchema } from '@/api/form-question/validation/form-question-schema';
import { surveillanceFormSchema } from '@/api/surveillance-form/validation/surveillance-form-schema';
import { buildMetadataReviewSections } from '@/features/review/workspace/metadata/utils/build-metadata-review-sections';
import { getMetadataReviewBlockers } from '@/features/review/workspace/metadata/utils/get-metadata-review-blockers';

const session = sessionSchema.parse({
    sessionId: 1,
    frontendId: 'session-1',
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
const secondSession = {
    ...session,
    sessionId: 2,
    collectorName: 'Other collector',
};
const surveillanceForm = surveillanceFormSchema.parse({
    formId: 1,
    sessionId: 1,
    submittedAt: 0,
    numPeopleSleptInHouse: null,
    wasIrsConducted: null,
    monthsSinceIrs: null,
    numLlinsAvailable: null,
    llinType: null,
    llinBrand: null,
    numPeopleSleptUnderLlin: null,
});

const question = formQuestionSchema.parse({
    id: 1,
    formId: 1,
    parentId: null,
    label: 'Required question',
    type: 'text',
    required: true,
    answerScope: 'SESSION',
    isUnitIdentityComponent: false,
    options: null,
    order: 1,
    prerequisite: null,
    createdAt: 0,
    updatedAt: 0,
});

test('builds dynamic sections and indexes nested questions for required-field checks', () => {
    const childQuestion = { ...question, id: 2, parentId: 1 };
    const result = buildMetadataReviewSections([session], {
        mode: 'dynamic',
        questions: [{ ...question, subQuestions: [childQuestion] }],
        formAnswersBySessionId: new Map(),
    });
    expect(result.questionsById.get(2)).toEqual(childQuestion);
    expect(result.resolvableSessions).toEqual([session]);
    expect(result.sessionsMissingSurveillanceForm).toEqual([]);
    expect(result.sections).toHaveLength(1);
    expect(
        getMetadataReviewBlockers(
            result.sections,
            new Map(),
            result.questionsById,
        ).areAllConflictsResolved,
    ).toBe(false);
});

test('excludes sessions missing a surveillance form when others have one', () => {
    const result = buildMetadataReviewSections([session, secondSession], {
        mode: 'surveillance',
        surveillanceFormBySessionId: new Map([
            [1, surveillanceForm],
            [2, null],
        ]),
    });
    expect(result.resolvableSessions).toEqual([session]);
    expect(result.sessionsMissingSurveillanceForm).toEqual([secondSession]);
    expect(result.questionsById.size).toBe(0);
    expect(
        getMetadataReviewBlockers(
            result.sections,
            new Map(),
            result.questionsById,
        ).unresolvedConflictCount,
    ).toBe(0);
});

test('keeps all sessions when none have surveillance forms, including core conflicts', () => {
    const sessions = [session, secondSession];
    const result = buildMetadataReviewSections(sessions, {
        mode: 'surveillance',
        surveillanceFormBySessionId: new Map([
            [1, null],
            [2, null],
        ]),
    });
    expect(result.resolvableSessions).toEqual(sessions);
    expect(result.sessionsMissingSurveillanceForm).toEqual([]);
    expect(
        getMetadataReviewBlockers(
            result.sections,
            new Map(),
            result.questionsById,
        ).unresolvedConflictCount,
    ).toBe(1);
});

test('supports an empty review unit', () => {
    const result = buildMetadataReviewSections([], {
        mode: 'surveillance',
        surveillanceFormBySessionId: new Map(),
    });
    expect(result.resolvableSessions).toEqual([]);
    expect(result.sessionsMissingSurveillanceForm).toEqual([]);
});
