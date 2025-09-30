import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toDomId } from '@/lib/shared/utils/dom';

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
  return (
    <Select
      value={selectedMorphId || ''}
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
        <SelectValue placeholder={`Select ${label}...`}>
          {selectedMorphId ? (
            <span> {selectedMorphId} </span>
          ) : (
            <span className="text-muted-foreground">Select {label}...</span>
          )}
        </SelectValue>
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
          disabled={selectedMorphId === undefined}
          className={cn(
            'text-destructive focus:text-destructive focus:bg-destructive/10',
            selectedMorphId === undefined && 'pointer-events-none opacity-50',
          )}
        >
          Remove selection
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
