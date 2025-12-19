'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import {
  SPECIES_MORPH_IDS,
  SEX_MORPH_IDS,
  ABDOMEN_STATUS_MORPH_IDS,
} from '@/shared/entities/specimen/morph-ids';
import {
  isAbdomenStatusEnabled,
  isSexEnabled,
} from '@/features/annotation/components/task-detail/annotation-form-panel/validation/annotation-form-schema';

export interface SpecimenFilters {
  species: string | null;
  sex: string | null;
  abdomenStatus: string | null;
}

const SPECIES_OPTIONS = Object.values(SPECIES_MORPH_IDS);
const SEX_OPTIONS = Object.values(SEX_MORPH_IDS);
const ABDOMEN_STATUS_OPTIONS = Object.values(ABDOMEN_STATUS_MORPH_IDS);

interface SpecimenFiltersProps {
  filters: SpecimenFilters;
  onFiltersChange: (filters: SpecimenFilters) => void;
  disabled?: boolean;
}

export function SpecimenFiltersBar({
  filters,
  onFiltersChange,
  disabled = false,
}: SpecimenFiltersProps) {
  const sexEnabled = isSexEnabled(filters.species ?? undefined);
  const abdomenStatusEnabled = isAbdomenStatusEnabled(
    filters.species ?? undefined,
    filters.sex ?? undefined,
  );

  const effectiveSpecies = filters.species ?? 'all';
  const effectiveSex = filters.sex ?? 'all';
  const effectiveAbdomenStatus = filters.abdomenStatus ?? 'all';

  function handleSpeciesChange(value: string) {
    const nextSpecies = value === 'all' ? null : value;
    onFiltersChange({ species: nextSpecies, sex: null, abdomenStatus: null });
  }

  function handleSexChange(value: string) {
    const nextSex = value === 'all' ? null : value;
    onFiltersChange({ ...filters, sex: nextSex, abdomenStatus: null });
  }

  function handleAbdomenStatusChange(value: string) {
    const nextStatus = value === 'all' ? null : value;
    onFiltersChange({ ...filters, abdomenStatus: nextStatus });
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select
        value={effectiveSpecies}
        onValueChange={handleSpeciesChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Species" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Species</SelectItem>
          {SPECIES_OPTIONS.map(species => (
            <SelectItem key={species} value={species}>
              {species}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={effectiveSex}
        onValueChange={handleSexChange}
        disabled={disabled || !sexEnabled}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Sexes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sexes</SelectItem>
          {SEX_OPTIONS.map(sex => (
            <SelectItem key={sex} value={sex}>
              {sex}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={effectiveAbdomenStatus}
        onValueChange={handleAbdomenStatusChange}
        disabled={disabled || !abdomenStatusEnabled}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {ABDOMEN_STATUS_OPTIONS.map(status => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
