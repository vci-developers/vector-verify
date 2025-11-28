'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { MapPin } from 'lucide-react';

interface DistrictFilterProps {
  districts: string[];
  selectedDistrict: string | null;
  onDistrictSelected: (district: string | null) => void;
  disabled?: boolean;
}

export function DistrictFilter({
  districts,
  selectedDistrict,
  onDistrictSelected,
  disabled = false,
}: DistrictFilterProps) {
  const effectiveSelectedDistrict = selectedDistrict || 'all';
  const hasDistricts = districts.length > 0;

  return (
    <div className="flex items-center gap-2">
      <MapPin className="text-muted-foreground h-4 w-4" />
      <Select
        value={effectiveSelectedDistrict}
        onValueChange={value =>
          onDistrictSelected(value === 'all' ? null : value)
        }
        disabled={disabled || !hasDistricts}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Districts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Districts</SelectItem>
          {districts.map(district => (
            <SelectItem key={district} value={district}>
              {district}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
