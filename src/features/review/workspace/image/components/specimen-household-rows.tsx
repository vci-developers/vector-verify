import { useGetFormAnswersBySessionIds } from '@/api/form-answer/hooks/use-get-form-answers-by-session-id';
import { useGetCurrentFormByProgramId } from '@/api/form/hooks/use-get-current-form-by-program-id';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import { Skeleton } from '@/components/ui/skeleton';
import { getSpecimenHousehold } from '@/features/review/utils/household-specimens';
import { flattenQuestions } from '@/features/review/workspace/metadata/utils/metadata-section';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';

interface SpecimenHouseholdRowsProps {
    specimen: Specimen;
    programId: number;
}

export default function SpecimenHouseholdRows({
    specimen,
    programId,
}: SpecimenHouseholdRowsProps) {
    const t = useTranslations('ReviewImage');
    const {
        data: getCurrentFormByProgramIdResult,
        isPending: isGetCurrentFormByProgramIdPending,
    } = useGetCurrentFormByProgramId(programId);
    const [formAnswersQuery] = useGetFormAnswersBySessionIds([
        specimen.sessionId,
    ]);

    const isPending =
        isGetCurrentFormByProgramIdPending || formAnswersQuery?.isPending;
    const isError =
        getCurrentFormByProgramIdResult?.ok === false ||
        formAnswersQuery?.isError ||
        formAnswersQuery?.data?.ok === false;
    const skeletonVariant = isError ? 'destructive' : 'default';

    const unitIdentityQuestionKeys = getCurrentFormByProgramIdResult?.ok
        ? flattenQuestions(getCurrentFormByProgramIdResult.data.questions ?? [])
              .filter(question => question.isUnitIdentityComponent)
              .map(question => question.questionKey)
        : [];
    const { householdNumber, collectionLocation } = getSpecimenHousehold(
        formAnswersQuery?.data?.ok ? formAnswersQuery.data.data.answers : [],
        specimen.sessionUnitId,
        unitIdentityQuestionKeys,
    );

    return (
        <Fragment>
            <dt className="text-muted-foreground">{t('household')}</dt>
            <dd>
                {isPending || isError ? (
                    <Skeleton
                        height="sm"
                        width="sm"
                        variant={skeletonVariant}
                    />
                ) : (
                    (householdNumber ?? '—')
                )}
            </dd>
            <dt className="text-muted-foreground">{t('collectionLocation')}</dt>
            <dd>
                {isPending || isError ? (
                    <Skeleton
                        height="sm"
                        width="sm"
                        variant={skeletonVariant}
                    />
                ) : (
                    (collectionLocation ?? '—')
                )}
            </dd>
        </Fragment>
    );
}
