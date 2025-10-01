import { useEffect, useState } from 'react';

/**
 * Hook to accumulate and maintain a stable list of all unique districts
 * seen across API responses. This prevents the district filter dropdown
 * from shrinking when filters are applied.
 */
export function useAccumulatedDistricts(
  currentDistricts: string[] | undefined,
): string[] {
  const [allDistricts, setAllDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (currentDistricts && currentDistricts.length > 0) {
      setAllDistricts(prev => {
        const combined = [...prev, ...currentDistricts];
        // Remove duplicates and sort alphabetically
        return Array.from(new Set(combined)).sort();
      });
    }
  }, [currentDistricts]);

  return allDistricts;
}
