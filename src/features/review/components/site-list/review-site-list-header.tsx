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
import MonthPicker from '@/components/ui/month-picker';

interface ReviewSiteListHeaderProps {
    districts: string[];
    selectedDistrict: string;
    onDistrictChange: (district: string) => void;
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
            <Select value={selectedDistrict} onValueChange={onDistrictChange}>
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
                maxDate={new Date()}
            />
        </div>
    );
}
