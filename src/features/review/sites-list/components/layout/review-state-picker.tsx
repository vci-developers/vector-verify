'use client';

import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from '@/components/ui/multi-select';
import {
    REVIEW_STATE_LABEL_KEY,
    type ReviewState,
} from '@/features/review/sites-list/utils/filter-segment-by-review-state';
import { REVIEW_STATE_SEVERITY_ORDER } from '@/features/review/utils/review-site-session-summary';
import { useTranslations } from 'next-intl';

interface ReviewStatePickerProps {
    selectedStates: ReviewState[];
    onSelectedStatesChange: (states: ReviewState[]) => void;
    disabled: boolean;
}

export default function ReviewStatePicker({
    selectedStates,
    onSelectedStatesChange,
    disabled,
}: ReviewStatePickerProps) {
    const t = useTranslations('ReviewSitesList');

    return (
        <MultiSelect
            values={selectedStates}
            onValuesChange={values =>
                onSelectedStatesChange(values as ReviewState[])
            }
        >
            <MultiSelectTrigger className="w-52" disabled={disabled}>
                <MultiSelectValue
                    placeholder={t('allStates')}
                    overflowBehavior="cutoff"
                />
            </MultiSelectTrigger>
            <MultiSelectContent search={false}>
                <MultiSelectGroup>
                    {REVIEW_STATE_SEVERITY_ORDER.map(state => (
                        <MultiSelectItem
                            key={state}
                            value={state}
                            badgeLabel={t(REVIEW_STATE_LABEL_KEY[state])}
                            className="pr-6"
                        >
                            {t(REVIEW_STATE_LABEL_KEY[state])}
                        </MultiSelectItem>
                    ))}
                </MultiSelectGroup>
            </MultiSelectContent>
        </MultiSelect>
    );
}
