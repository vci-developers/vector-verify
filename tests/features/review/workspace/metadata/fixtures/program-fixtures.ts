import { getFormAnswersBySessionIdResponseSchema } from '@/api/form-answer/validation/get-form-answers-by-session-id-schema';
import { formSchema } from '@/api/form/validation/form-schema';
import { sessionSchema } from '@/api/session/validation/session-schema';
import { surveillanceFormSchema } from '@/api/surveillance-form/validation/surveillance-form-schema';
import colombia from './colombia-program.json';
import ghana from './ghana-program.json';
import kenya from './kenya-program.json';
import uganda from './uganda-program.json';

function parseProgramFixture(recordedProgram: {
    program: string;
    form: unknown;
    sessions: unknown[];
    formAnswersBySessionId: Record<string, unknown>;
    surveillanceFormBySessionId: Record<string, unknown>;
}) {
    return {
        program: recordedProgram.program,
        form: recordedProgram.form
            ? formSchema.parse(recordedProgram.form)
            : null,
        sessions: recordedProgram.sessions.map(session =>
            sessionSchema.parse(session),
        ),
        formAnswersBySessionId: new Map(
            Object.entries(recordedProgram.formAnswersBySessionId).map(
                ([sessionId, formAnswers]) => [
                    Number(sessionId),
                    getFormAnswersBySessionIdResponseSchema.parse(formAnswers),
                ],
            ),
        ),
        surveillanceFormBySessionId: new Map(
            Object.entries(recordedProgram.surveillanceFormBySessionId).map(
                ([sessionId, surveillanceForm]) => [
                    Number(sessionId),
                    surveillanceFormSchema.parse(surveillanceForm),
                ],
            ),
        ),
    };
}

export type ProgramFixture = ReturnType<typeof parseProgramFixture>;

export const programFixtures = [uganda, ghana, kenya, colombia].map(
    parseProgramFixture,
);

export const dynamicFormProgramFixtures = programFixtures.filter(
    programFixture => programFixture.form !== null,
);

export const kenyaProgramFixture = parseProgramFixture(kenya);
