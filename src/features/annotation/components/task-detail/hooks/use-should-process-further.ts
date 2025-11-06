import { useEffect, useState } from 'react';
import type { Specimen } from '@/shared/entities/specimen/model';

export function useShouldProcessFurther(specimen?: Specimen | null) {
  const [shouldProcessFurther, setShouldProcessFurther] =
    useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!specimen?.id) {
      setShouldProcessFurther(null);
      setIsLoading(false);
      return;
    }

    if (specimen.shouldProcessFurther === undefined) {
      setIsLoading(true);
      fetch(`/api/bff/specimens/${specimen.id}`)
        .then(r => r.json())
        .then(data => {
          setShouldProcessFurther(data.shouldProcessFurther ?? false);
          setIsLoading(false);
        })
        .catch(() => {
          setShouldProcessFurther(false);
          setIsLoading(false);
        });
    } else {
      setShouldProcessFurther(null);
      setIsLoading(false);
    }
  }, [specimen?.id, specimen?.shouldProcessFurther]);

  const value =
    shouldProcessFurther !== null
      ? shouldProcessFurther
      : (specimen?.shouldProcessFurther ?? false);

  return { shouldProcessFurther: value, isLoading };
}

