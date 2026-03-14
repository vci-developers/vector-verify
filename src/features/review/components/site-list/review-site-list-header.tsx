'use client';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import MonthPicker from '@/features/review/components/site-list/month-picker';

interface ReviewSiteListHeaderProps {
    districts: string[];
    selectedDistrict: string | null;
    onDistrictChange: (district: string | null) => void;
    selectedMonth: Date;
    onMonthChange: (month: Date) => void;
}

export default function ReviewSiteListHeader({
    districts,
    selectedDistrict,
    onDistrictChange,
    selectedMonth,
    onMonthChange,
}: ReviewSiteListHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <Select
                value={selectedDistrict ?? ''}
                onValueChange={value => onDistrictChange(value || null)}
            >
                <SelectTrigger className="w-52">
                    <SelectValue placeholder="Select a district" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>District</SelectLabel>
                        {districts.map(district => (
                            <SelectItem key={district} value={district}>
                                {district}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

            <MonthPicker
                selectedMonth={selectedMonth}
                onMonthChange={onMonthChange}
            />
        </div>
    );
}
