import { useEffect, useState } from 'react';

export function useAccumulatedDistricts(
  currentDistricts: string[] | undefined,
): string[] {
  const [allDistricts, setAllDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (currentDistricts && currentDistricts.length > 0) {
      setAllDistricts(prev => {
        const combined = [...prev, ...currentDistricts];
        return Array.from(new Set(combined)).sort();
      });
    }
  }, [currentDistricts]);

  return allDistricts;
}
