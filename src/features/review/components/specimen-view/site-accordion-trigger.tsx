'use client';

import { AccordionTrigger } from '@/ui/accordion';
import { useSiteStatistics } from './site-statistics';
import { formatHouseNumber } from './utils';
import type { SpecimensQuery } from '@/features/review/types';

interface SiteAccordionTriggerProps {
  siteId: number;
  houseNumber: string;
  filterQuery: SpecimensQuery;
}

export function SiteAccordionTrigger({
  siteId,
  houseNumber,
  filterQuery,
}: SiteAccordionTriggerProps) {
  const { totalSpecimens, totalImages, isLoading } = useSiteStatistics({
    siteId,
    queryParameters: filterQuery,
    enabled: true,
  });

  const displayHouseNumber = formatHouseNumber(houseNumber);

  return (
    <AccordionTrigger className="w-full px-4 py-3 hover:no-underline">
      <div className="grid w-full grid-cols-4 items-center gap-8">
        <span className="text-base font-semibold">{displayHouseNumber}</span>
        <span className="text-muted-foreground text-sm">
          (Site ID: {siteId})
        </span>
        {!isLoading ? (
          <>
            <span className="text-muted-foreground text-sm">
              Total Specimens: {totalSpecimens}
            </span>
            <span className="text-muted-foreground text-sm">
              Total Images: {totalImages}
            </span>
          </>
        ) : (
          <>
            <span className="text-muted-foreground text-sm">Loading...</span>
            <span></span>
          </>
        )}
      </div>
    </AccordionTrigger>
  );
}
