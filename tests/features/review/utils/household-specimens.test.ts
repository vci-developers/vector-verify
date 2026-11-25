import { expect, test } from 'vitest';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';
import {
    getSpecimenHousehold,
    orderSpecimensByHousehold,
} from '@/features/review/utils/household-specimens';
import { kenyaProgramFixture } from '../workspace/metadata/fixtures/program-fixtures';

const sessions = kenyaProgramFixture.sessions;
const firstSessionId = 3001;
const secondSessionId = 3002;

function buildSpecimen(
    specimenId: string,
    sessionId: number,
    sessionUnitId: number | null,
) {
    return specimenSchema.parse({
        id: 0,
        specimenId,
        sessionId,
        sessionUnitId,
        thumbnailUrl: null,
        thumbnailImageId: null,
        thumbnailImage: null,
    });
}

function getFormAnswers(sessionId: number) {
    return (
        kenyaProgramFixture.formAnswersBySessionId.get(sessionId)?.answers ?? []
    );
}

const unitIdentityQuestionKeys = [
    'where_is_mosquito_collection_taking_place_2',
];

test('orders specimens by session order, then unit, with no-unit specimens last', () => {
    const specimens = [
        buildSpecimen('second-unit', secondSessionId, 3801),
        buildSpecimen('first-no-unit', firstSessionId, null),
        buildSpecimen('first-later-unit', firstSessionId, 3802),
        buildSpecimen('first-unit', firstSessionId, 3800),
    ];

    expect(
        orderSpecimensByHousehold(specimens, sessions).map(
            specimen => specimen.specimenId,
        ),
    ).toEqual([
        'first-unit',
        'first-later-unit',
        'first-no-unit',
        'second-unit',
    ]);
});

test('keeps the original order within the same unit', () => {
    const specimens = [
        buildSpecimen('a', firstSessionId, 3800),
        buildSpecimen('b', firstSessionId, 3800),
    ];

    expect(
        orderSpecimensByHousehold(specimens, sessions).map(
            specimen => specimen.specimenId,
        ),
    ).toEqual(['a', 'b']);
});

test('reads the household number and the unit collection location', () => {
    expect(
        getSpecimenHousehold(
            getFormAnswers(firstSessionId),
            3800,
            unitIdentityQuestionKeys,
        ),
    ).toEqual({
        householdNumber: 'text-2',
        collectionLocation: 'Animal Shelter',
    });
    expect(
        getSpecimenHousehold(
            getFormAnswers(secondSessionId),
            3801,
            unitIdentityQuestionKeys,
        ),
    ).toEqual({ householdNumber: 'text-32', collectionLocation: 'Indoors' });
});

test('has no collection location when the specimen has no unit', () => {
    expect(
        getSpecimenHousehold(
            getFormAnswers(firstSessionId),
            null,
            unitIdentityQuestionKeys,
        ).collectionLocation,
    ).toBeNull();
});

test('has no household number when the session has no answers', () => {
    expect(getSpecimenHousehold([], 3800, unitIdentityQuestionKeys)).toEqual({
        householdNumber: null,
        collectionLocation: null,
    });
});

test('treats an empty household answer as missing', () => {
    const [householdNumberAnswer] = getFormAnswers(firstSessionId).filter(
        formAnswer =>
            formAnswer.questionKey === 'assign_this_household_a_number',
    );
    expect(
        getSpecimenHousehold(
            householdNumberAnswer
                ? [{ ...householdNumberAnswer, value: '' }]
                : [],
            null,
            unitIdentityQuestionKeys,
        ).householdNumber,
    ).toBeNull();
});
