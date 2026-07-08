'use client';

import type { Program } from '@/api/program/validation/program-schema';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';

const ALL_PROGRAMS = 'all';

interface UserAnalyticsProgramSelectProps {
    value: number | 'all';
    onValueChange: (value: number | 'all') => void;
    programs: Program[];
    isLoading: boolean;
    hasError: boolean;
}

export default function UserAnalyticsProgramSelect({
    value,
    onValueChange,
    programs,
    isLoading,
    hasError,
}: UserAnalyticsProgramSelectProps) {
    const t = useTranslations('UserAnalytics');

    return (
        <Select
            value={String(value)}
            onValueChange={selectedValue =>
                onValueChange(
                    selectedValue === ALL_PROGRAMS
                        ? ALL_PROGRAMS
                        : Number(selectedValue),
                )
            }
            disabled={isLoading || hasError}
        >
            <SelectTrigger className="w-full">
                <SelectValue
                    placeholder={
                        isLoading
                            ? t('loadingPrograms')
                            : hasError
                              ? t('programsError')
                              : t('selectProgram')
                    }
                />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={ALL_PROGRAMS}>{t('allPrograms')}</SelectItem>
                {programs.map(program => (
                    <SelectItem
                        key={program.programId}
                        value={String(program.programId)}
                    >
                        {program.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
