import { expect, test } from 'vitest';
import {
    formQuestionTypeSchema,
    type FormQuestion,
} from '@/api/form-question/validation/form-question-schema';
import { flattenQuestions } from '@/features/review/workspace/metadata/utils/metadata-section';
import {
    dynamicFormProgramFixtures,
    programFixtures,
} from '../../../features/review/workspace/metadata/fixtures/program-fixtures';

test('parses every recorded program', () => {
    expect(programFixtures.map(fixture => fixture.program)).toEqual([
        'uganda',
        'ghana',
        'kenya',
        'colombia',
    ]);
});

test('recorded forms cover every supported question type', () => {
    const recordedQuestions: FormQuestion[] =
        dynamicFormProgramFixtures.flatMap(fixture =>
            flattenQuestions(fixture.form?.questions ?? []),
        );
    expect(new Set(recordedQuestions.map(question => question.type))).toEqual(
        new Set(formQuestionTypeSchema.options),
    );
});
