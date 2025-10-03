import React from 'react';
import type { DistrictOption } from '@/lib/review/types';

interface SimplifiedDistrictDisplayProps {
  district: DistrictOption;
}

/**
 * Simplified district display component for single-district users
 * Shows district name as text instead of a dropdown
 */
export function SimplifiedDistrictDisplay({
  district,
}: SimplifiedDistrictDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">District:</span>
      <span className="text-sm font-medium">{district.label}</span>
    </div>
  );
}
