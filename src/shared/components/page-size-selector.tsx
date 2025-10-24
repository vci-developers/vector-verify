'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { List } from 'lucide-react';

interface PageSizeSelectorProps {
  value: number;
  onValueChange: (value: string) => void;
  options?: readonly number[];
  disabled?: boolean;
}

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

export function PageSizeSelector({
  value,
  onValueChange,
  options = DEFAULT_PAGE_SIZES,
  disabled = false,
}: PageSizeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <List className="text-muted-foreground h-4 w-4" />
      <span className="text-muted-foreground text-sm">Show:</span>
      <Select
        value={String(value)}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-20">
          <SelectValue placeholder="Page size" />
        </SelectTrigger>
        <SelectContent>
          {options.map(size => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground text-sm">per page</span>
    </div>
  );
}
