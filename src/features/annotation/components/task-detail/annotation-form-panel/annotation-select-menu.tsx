'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/ui/select';
import { cn } from '@/shared/core/utils';
import { toDomId } from '@/shared/core/utils/dom';

interface AnnotationSelectMenuProps {
  label: string;
  options: readonly string[];
  selectedValue?: string;
  onSelect: (value?: string) => void;
  disabled?: boolean;
  isInvalid?: boolean;
  placeholder?: string;
}

export function AnnotationSelectMenu({
  label,
  options,
  selectedValue,
  onSelect,
  disabled,
  isInvalid,
  placeholder,
}: AnnotationSelectMenuProps) {
  const value = selectedValue || '';

  return (
    <Select
      value={value}
      onValueChange={newValue => onSelect(newValue === 'clear' ? undefined : newValue)}
      disabled={disabled}
    >
      <SelectTrigger
        id={toDomId(label)}
        className={cn(
          'w-full',
          isInvalid &&
            'border-destructive focus:border-destructive focus:ring-destructive',
        )}
      >
        <SelectValue placeholder={placeholder ?? `Select ${label}...`} />
      </SelectTrigger>
      <SelectContent align="start" className="max-h-100 w-full overflow-y-auto">
        {options.map(option => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}

        <SelectSeparator />
        <SelectItem
          value="clear"
          disabled={!selectedValue}
          className={cn(
            'text-destructive focus:text-destructive focus:bg-destructive/10',
            !selectedValue && 'pointer-events-none opacity-50',
          )}
        >
          Remove selection
        </SelectItem>
      </SelectContent>
    </Select>
  );
}


