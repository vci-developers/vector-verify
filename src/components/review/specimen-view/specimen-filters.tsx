'use client';

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    SPECIES_MORPH_IDS,
    SEX_MORPH_IDS,
    ABDOMEN_STATUS_MORPH_IDS,
} from '@/lib/entities/specimen/morph-ids';
import { isSexEnabled, isAbdomenStatusEnabled } from '@/components/annotate/task-detail/annotation-form-panel/validation/annotation-form-schema';

export interface SpecimenFilters {
    species: string | null;
    sex: string | null;
    abdomenStatus: string | null;
}

interface SpecimenFiltersProps {
    filters: SpecimenFilters;
    onFiltersChange: (filters: SpecimenFilters) => void;
    disabled?: boolean;
}

export function SpecimenFiltersComponent({
    filters,
    onFiltersChange,
    disabled = false,
}: SpecimenFiltersProps) {
    const sexEnabled = isSexEnabled(filters.species || undefined);
    const abdomenStatusEnabled = isAbdomenStatusEnabled(
        filters.species || undefined,
        filters.sex || undefined
    );

    const effectiveSpecies = filters.species || 'all';
    const effectiveSex = filters.sex || 'all';
    const effectiveAbdomenStatus = filters.abdomenStatus || 'all';

    const handleSpeciesChange = (value: string) => {
        const newSpecies = value === 'all' ? null : value;
        
        onFiltersChange({
            species: newSpecies,
            sex: null,
            abdomenStatus: null,
        });
    };

    const handleSexChange = (value: string) => {
        const newSex = value === 'all' ? null : value;
        
        onFiltersChange({
            ...filters,
            sex: newSex,
            abdomenStatus: null,
        });
    };

    const handleAbdomenStatusChange = (value: string) => {
        const newAbdomenStatus = value === 'all' ? null : value;
        
        onFiltersChange({
            ...filters,
            abdomenStatus: newAbdomenStatus,
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-4">
            <Select
                value={effectiveSpecies}
                onValueChange={handleSpeciesChange}
                disabled={disabled}
            >
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Species" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Species</SelectItem>
                    <SelectItem value="null">Unclassified</SelectItem>
                    {Object.entries(SPECIES_MORPH_IDS).map(([key, value]) => (
                        <SelectItem key={value} value={String(value)}>
                            {key.split('_').map(word => 
                                word.charAt(0) + word.slice(1).toLowerCase()
                            ).join(' ')}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={effectiveSex}
                onValueChange={handleSexChange}
                disabled={disabled || !sexEnabled}
            >
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Sexes" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Sexes</SelectItem>
                    <SelectItem value="null">Unclassified</SelectItem>
                    {Object.entries(SEX_MORPH_IDS).map(([key, value]) => (
                        <SelectItem key={value} value={String(value)}>
                            {key.charAt(0) + key.slice(1).toLowerCase()}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={effectiveAbdomenStatus}
                onValueChange={handleAbdomenStatusChange}
                disabled={disabled || !abdomenStatusEnabled}
            >
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="null">Unclassified</SelectItem>
                    {Object.entries(ABDOMEN_STATUS_MORPH_IDS).map(([key, value]) => (
                        <SelectItem key={value} value={String(value)}>
                            {key.split('_').map(word => 
                                word.charAt(0) + word.slice(1).toLowerCase()
                            ).join(' ')}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}