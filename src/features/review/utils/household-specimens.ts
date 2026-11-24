import type { FormAnswer } from '@/api/form-answer/validation/form-answer-schema';
import type { Session } from '@/api/session/validation/session-schema';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';

export const HOUSEHOLD_NUMBER_QUESTION_KEY = 'assign_this_household_a_number';

export function orderSpecimensByHousehold(
    specimens: Specimen[],
    sessions: Session[],
): Specimen[] {
    const sessionIndexBySessionId = new Map(
        sessions.map((session, index) => [session.sessionId, index]),
    );
    return specimens.toSorted(
        (specimen, otherSpecimen) =>
            (sessionIndexBySessionId.get(specimen.sessionId) ??
                Number.MAX_SAFE_INTEGER) -
                (sessionIndexBySessionId.get(otherSpecimen.sessionId) ??
                    Number.MAX_SAFE_INTEGER) ||
            (specimen.sessionUnitId ?? Number.MAX_SAFE_INTEGER) -
                (otherSpecimen.sessionUnitId ?? Number.MAX_SAFE_INTEGER),
    );
}

export function getSpecimenHousehold(
    formAnswers: FormAnswer[],
    sessionUnitId: number | null | undefined,
    unitIdentityQuestionKeys: string[],
) {
    const householdNumberAnswer = formAnswers.find(
        formAnswer => formAnswer.questionKey === HOUSEHOLD_NUMBER_QUESTION_KEY,
    );
    const collectionLocationAnswer = formAnswers.find(
        formAnswer =>
            formAnswer.sessionUnitId === sessionUnitId &&
            formAnswer.questionKey !== null &&
            unitIdentityQuestionKeys.includes(formAnswer.questionKey),
    );
    return {
        householdNumber:
            typeof householdNumberAnswer?.value === 'string'
                ? householdNumberAnswer.value || null
                : null,
        collectionLocation:
            sessionUnitId != null &&
            typeof collectionLocationAnswer?.value === 'string'
                ? collectionLocationAnswer.value || null
                : null,
    };
}
