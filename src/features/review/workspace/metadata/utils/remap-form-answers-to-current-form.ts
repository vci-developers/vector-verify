import type { FormAnswer } from '@/api/form-answer/validation/form-answer-schema';
import type { FormQuestion } from '@/api/form-question/validation/form-question-schema';
import { flattenQuestions } from './metadata-section';

export function remapFormAnswersToCurrentForm(
    formAnswers: FormAnswer[],
    answeredFormQuestions: FormQuestion[],
    currentFormQuestions: FormQuestion[],
): FormAnswer[] {
    const questionKeyByQuestionId = new Map(
        flattenQuestions(answeredFormQuestions).map(question => [
            question.id,
            question.questionKey,
        ]),
    );
    const currentQuestionIdByQuestionKey = new Map(
        flattenQuestions(currentFormQuestions).map(question => [
            question.questionKey,
            question.id,
        ]),
    );

    return formAnswers.map(formAnswer => {
        const questionKey = questionKeyByQuestionId.get(formAnswer.questionId);
        const currentQuestionId =
            questionKey === undefined
                ? undefined
                : currentQuestionIdByQuestionKey.get(questionKey);
        return currentQuestionId === undefined
            ? formAnswer
            : { ...formAnswer, questionId: currentQuestionId };
    });
}
