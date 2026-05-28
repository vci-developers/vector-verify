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
import type { ReviewTab } from '@/features/review/sites-list/components/review-sites-list-page-client';

interface ReviewSitesListHeaderProps {
    tabs: readonly { value: ReviewTab; label: string }[];
    activeTab: ReviewTab;
    onTabChange: (tab: ReviewTab) => void;
    locationTypeName: string;
    locationDropdownOptions: string[];
    selectedLocation: string;
    onLocationChange: (location: string) => void;
}

export default function ReviewSitesListHeader({
    tabs,
    activeTab,
    onTabChange,
    locationTypeName,
    locationDropdownOptions,
    selectedLocation,
    onLocationChange,
}: ReviewSitesListHeaderProps) {
    return (
        <div className="space-y-4">
            <Select value={selectedLocation} onValueChange={onLocationChange}>
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
    );
}
