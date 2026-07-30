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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ReviewTab } from '@/features/review/view-state/use-review-filters';

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
    return (
        <div className="flex items-start justify-between">
            <div className="space-y-4">
                <Select
                    value={selectedLocation}
                    onValueChange={onLocationChange}
                >
                    <SelectTrigger className="w-52">
                        <SelectValue
                            placeholder={`Select a ${locationTypeName.toLowerCase()}`}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>{locationTypeName}</SelectLabel>
                            {locationDropdownOptions.map(option => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Tabs
                    value={activeTab}
                    onValueChange={value => onTabChange(value as ReviewTab)}
                >
                    <TabsList className="bg-muted/50 rounded-full p-1">
                        {tabs.map(tab => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex items-center gap-3">
                <ReviewStatePicker
                    selectedReviewStates={selectedReviewStates}
                    onSelectedReviewStatesChange={onSelectedReviewStatesChange}
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
    );
}
