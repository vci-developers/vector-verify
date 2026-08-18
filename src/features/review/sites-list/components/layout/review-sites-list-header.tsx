import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import CollectionCyclePicker from '@/features/review/sites-list/components/layout/collection-cycle-picker';
import ReviewStatePicker from '@/features/review/sites-list/components/layout/review-state-picker';
import type { SessionState } from '@/api/session/validation/session-schema';
import MonthRangePicker from '@/components/ui/month-range-picker';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ReviewTab } from '@/features/review/view-state/use-review-filters';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';

interface ReviewSitesListHeaderProps {
    tabs: readonly { value: ReviewTab; label: string }[];
    activeTab: ReviewTab;
    onTabChange: (tab: ReviewTab) => void;
    locationTypeName: string;
    locationDropdownOptions: string[];
    selectedLocation: string;
    onLocationChange: (location: string) => void;
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    onSelectedCycleIdsChange: (ids: number[]) => void;
    selectedReviewStates: SessionState[];
    onSelectedReviewStatesChange: (states: SessionState[]) => void;
    disabled: boolean;
    startMonth: Date;
    endMonth: Date;
    onStartMonthChange: (month: Date) => void;
    onEndMonthChange: (month: Date) => void;
    maxDate: Date;
}

export default function ReviewSitesListHeader({
    tabs,
    activeTab,
    onTabChange,
    locationTypeName,
    locationDropdownOptions,
    selectedLocation,
    onLocationChange,
    collectionCycles,
    selectedCycleIds,
    onSelectedCycleIdsChange,
    selectedReviewStates,
    onSelectedReviewStatesChange,
    disabled,
    startMonth,
    endMonth,
    onStartMonthChange,
    onEndMonthChange,
    maxDate,
}: ReviewSitesListHeaderProps) {
    const t = useTranslations('ReviewSessionsTable');
    const showAllLocationsOption = activeTab === 'sessions';

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Select
                    value={
                        showAllLocationsOption
                            ? selectedLocation || 'ALL'
                            : selectedLocation
                    }
                    onValueChange={value =>
                        onLocationChange(value === 'ALL' ? '' : value)
                    }
                >
                    <SelectTrigger className="w-52">
                        <SelectValue
                            placeholder={`Select a ${locationTypeName.toLowerCase()}`}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>{locationTypeName}</SelectLabel>
                            {showAllLocationsOption && (
                                <SelectItem value="ALL">
                                    {t('allLocations')}
                                </SelectItem>
                            )}
                            {locationDropdownOptions.map(option => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-3">
                    <ReviewStatePicker
                        selectedReviewStates={selectedReviewStates}
                        onSelectedReviewStatesChange={
                            onSelectedReviewStatesChange
                        }
                        disabled={disabled}
                    />
                    <CollectionCyclePicker
                        collectionCycles={collectionCycles}
                        selectedCycleIds={selectedCycleIds}
                        onSelectedCycleIdsChange={onSelectedCycleIdsChange}
                        disabled={disabled}
                    />
                    <MonthRangePicker
                        startMonth={startMonth}
                        endMonth={endMonth}
                        onStartMonthChange={onStartMonthChange}
                        onEndMonthChange={onEndMonthChange}
                        maxDate={maxDate}
                    />
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={value => onTabChange(value as ReviewTab)}
            >
                <TabsList className="bg-muted/50 rounded-full p-1">
                    {tabs.map(tab => (
                        <Fragment key={tab.value}>
                            {tab.value === 'sessions' && (
                                <Separator
                                    orientation="vertical"
                                    className="bg-muted-foreground/40 mx-1 h-6 w-px shrink-0 self-center"
                                />
                            )}
                            <TabsTrigger
                                value={tab.value}
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
                            >
                                {tab.label}
                            </TabsTrigger>
                        </Fragment>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}
