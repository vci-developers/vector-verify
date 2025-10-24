'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/shared/ui/select';
import { cn } from '@/shared/core/utils';
import { toDomId } from '@/shared/core/utils/dom';

interface MorphIdSelectMenuProps {
  label: string;
  morphIds: readonly string[];
  selectedMorphId: string | undefined;
  onMorphSelect: (morphId?: string) => void;
  disabled?: boolean;
  inValid?: boolean;
}

export default function MorphIdSelectMenu({
  label,
  morphIds,
  selectedMorphId,
  onMorphSelect,
  disabled,
  inValid,
}: MorphIdSelectMenuProps) {
  const value = selectedMorphId || '';

  return (
    <Select
      value={value}
      onValueChange={value =>
        onMorphSelect(value === 'clear' ? undefined : value)
      }
      disabled={disabled}
    >
      <SelectTrigger
        id={toDomId(label)}
        className={cn(
          'w-full',
          inValid &&
            'border-destructive focus:border-destructive focus:ring-destructive',
        )}
      >
        <SelectValue placeholder={`Select ${label}...`} />
      </SelectTrigger>
      <SelectContent align="start" className="max-h-100 w-full overflow-y-auto">
        {morphIds.map(morphId => (
          <SelectItem key={morphId} value={morphId}>
            {morphId}
          </SelectItem>
        ))}

        <SelectSeparator />
        <SelectItem
          value="clear"
          disabled={!selectedMorphId}
          className={cn(
            'text-destructive focus:text-destructive focus:bg-destructive/10',
            !selectedMorphId && 'pointer-events-none opacity-50',
          )}
        >
          Remove selection
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
