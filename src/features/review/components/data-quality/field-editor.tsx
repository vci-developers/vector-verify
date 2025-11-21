import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import type { SiteDiscrepancySummary } from '@/features/review/types';
import { parseFieldOptions } from '@/features/review/utils/discrepancy-field-dependencies';

interface FieldEditorProps {
  field: SiteDiscrepancySummary['fields'][number];
  value: string;
  isCustomInput: boolean;
  isDisabled: boolean;
  isPending: boolean;
  onSelectChange: (value: string) => void;
  onCustomInputChange: (value: string) => void;
  onBackToOptions: () => void;
}

export function FieldEditor({
  field,
  value,
  isCustomInput,
  isDisabled,
  isPending,
  onSelectChange,
  onCustomInputChange,
  onBackToOptions,
}: FieldEditorProps) {
  const options = parseFieldOptions(field.details);

  if (isCustomInput) {
    return (
      <div className="space-y-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onCustomInputChange(e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className="max-w-md bg-white border-amber-400 focus-visible:ring-amber-300"
          disabled={isPending || isDisabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBackToOptions}
          className="text-xs text-amber-700 hover:text-amber-900"
          disabled={isDisabled}
        >
          Back to options
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={onSelectChange}
      disabled={isPending || isDisabled}
    >
      <SelectTrigger className="max-w-md bg-white border-amber-400 focus:ring-amber-300">
        <SelectValue placeholder={`Select ${field.label}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
        <SelectItem value="__OTHER__">
          Other (type custom value)
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
