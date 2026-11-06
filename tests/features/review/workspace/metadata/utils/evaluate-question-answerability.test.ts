import { describe, expect, test } from 'vitest';
import type {
    PrerequisiteExpression,
    PrerequisitePredicate,
} from '@/api/form-question/validation/prerequisite-expression-schema';
import { buildDynamicFormMetadata } from '@/features/review/workspace/metadata/utils/build-dynamic-form-metadata';
import { evaluateDisabledRowIds } from '@/features/review/workspace/metadata/utils/evaluate-question-answerability';
import type { MetadataSection } from '@/features/review/workspace/metadata/utils/metadata-section';
import type { FormQuestion } from '@/api/form-question/validation/form-question-schema';
import {
    dynamicFormProgramFixtures,
    type ProgramFixture,
} from '../fixtures/program-fixtures';

function buildProgramMetadata(programFixture: ProgramFixture) {
    if (!programFixture.form) throw new Error('Program has no dynamic form');
    return buildDynamicFormMetadata(
        programFixture.sessions,
        programFixture.formAnswersBySessionId,
        programFixture.form,
    );
}

function listPredicates(
    expression: PrerequisiteExpression,
): PrerequisitePredicate[] {
    if ('all' in expression) return expression.all.flatMap(listPredicates);
    if ('any' in expression) return expression.any.flatMap(listPredicates);
    return [expression];
}

function toResolution(
    predicate: PrerequisitePredicate,
    isMet: boolean,
): string | string[] {
    const { operator, value } = predicate;
    if (operator === 'contains') {
        return isMet ? [String(value)] : 'N/A';
    }
    if (operator === 'gt') {
        return String(Number(value) + (isMet ? 1 : 0));
    }
    if (typeof value === 'boolean') {
        return value === isMet ? 'Yes' : 'No';
    }
    return isMet ? String(value) : 'N/A';
}

function findSessionRowId(section: MetadataSection, questionId: number) {
    return section.rows.find(row => row.fieldName === String(questionId))?.id;
}

function addResolutionsThatEnable(
    question: FormQuestion,
    section: MetadataSection,
    questionsById: Map<number, FormQuestion>,
    resolutionsByMetadataRowId: Map<string, string | string[]>,
) {
    if (!question.prerequisite) return;
    for (const predicate of listPredicates(question.prerequisite)) {
        const parentRowId = findSessionRowId(section, predicate.questionId);
        const parentQuestion = questionsById.get(predicate.questionId);
        if (!parentRowId || !parentQuestion) continue;
        resolutionsByMetadataRowId.set(
            parentRowId,
            toResolution(predicate, true),
        );
        addResolutionsThatEnable(
            parentQuestion,
            section,
            questionsById,
            resolutionsByMetadataRowId,
        );
    }
}

describe.each(dynamicFormProgramFixtures)(
    '$program prerequisites',
    programFixture => {
        const { sections, questionsById } =
            buildProgramMetadata(programFixture);
        const sessionSection = sections[0] as MetadataSection;
        const sessionQuestions = [...questionsById.values()].filter(
            question =>
                question.answerScope === 'SESSION' &&
                question.prerequisite !== null,
        );

        test.each(sessionQuestions)(
            'enables $questionKey only when its prerequisite is met',
            question => {
                const rowId = findSessionRowId(sessionSection, question.id);
                const resolutionsByMetadataRowId = new Map<
                    string,
                    string | string[]
                >();
                addResolutionsThatEnable(
                    question,
                    sessionSection,
                    questionsById,
                    resolutionsByMetadataRowId,
                );
                expect(
                    evaluateDisabledRowIds(
                        sections,
                        resolutionsByMetadataRowId,
                        questionsById,
                    ).has(String(rowId)),
                ).toBe(false);

                const firstPredicate = listPredicates(
                    question.prerequisite as PrerequisiteExpression,
                )[0] as PrerequisitePredicate;
                resolutionsByMetadataRowId.set(
                    String(
                        findSessionRowId(
                            sessionSection,
                            firstPredicate.questionId,
                        ),
                    ),
                    toResolution(firstPredicate, false),
                );
                expect(
                    evaluateDisabledRowIds(
                        sections,
                        resolutionsByMetadataRowId,
                        questionsById,
                    ).has(String(rowId)),
                ).toBe(true);
            },
        );
    },
);
