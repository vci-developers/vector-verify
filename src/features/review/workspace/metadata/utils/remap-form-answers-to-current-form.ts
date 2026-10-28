import type { FormAnswer } from '@/api/form-answer/validation/form-answer-schema';
import type { FormQuestion } from '@/api/form-question/validation/form-question-schema';
import { flattenQuestions } from './metadata-section';

export function remapFormAnswersToCurrentForm(
    formAnswers: FormAnswer[],
    currentFormQuestions: FormQuestion[],
): FormAnswer[] {
    const currentQuestionIdByQuestionKey = new Map(
        flattenQuestions(currentFormQuestions).map(question => [
            question.questionKey,
            question.id,
        ]),
    );

    return formAnswers.map(formAnswer => {
        const currentQuestionId =
            formAnswer.questionKey === null
                ? undefined
                : currentQuestionIdByQuestionKey.get(formAnswer.questionKey);
        return currentQuestionId === undefined
            ? formAnswer
            : { ...formAnswer, questionId: currentQuestionId };
    });
}
