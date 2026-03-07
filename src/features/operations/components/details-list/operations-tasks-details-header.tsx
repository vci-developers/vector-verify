'use client'

import type { Site } from "@/api/site/validation/site-schema";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type ViewValue = "village" | "house" | "";

interface OperationsTasksDetailsHeaderProps {
    accessibleSites: Site[];
    activeView: ViewValue;
    onViewChange: (view: ViewValue) => void;
}

export default function OperationsTasksDetailsHeader({
    accessibleSites,
    activeView,
    onViewChange,
}: OperationsTasksDetailsHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <Select
                value={activeView || undefined}
                onValueChange={value => onViewChange(value as ViewValue)}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Location</SelectLabel>

                        <SelectItem value="village">Village</SelectItem>

                        <SelectItem value="house">House</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}
