'use client';

import { AccordionTrigger } from '@/ui/accordion';
import { useSiteStatistics } from './site-statistics';
import { formatHouseNumber } from './utils';
import type { SpecimensQuery } from '@/features/review/types';

interface SiteAccordionTriggerProps {
  siteId: number;
  houseNumber: string;
  villageName?: string | null;
  filterQuery: SpecimensQuery;
}

export function SiteAccordionTrigger({
  siteId,
  houseNumber,
  villageName,
  filterQuery,
}: SiteAccordionTriggerProps) {
  const { totalSpecimens, totalImages, isLoading, isPartial } = useSiteStatistics({
    siteId,
    queryParameters: filterQuery,
    enabled: true,
  });

  const displayHouseNumber = formatHouseNumber(houseNumber);
  const displayVillageName = villageName || `Site ${siteId}`;

  return (
    <AccordionTrigger className="w-full px-4 py-3 hover:no-underline">
      <div className="grid w-full grid-cols-4 items-center gap-8">
        <span className="text-base font-semibold">{displayHouseNumber}</span>
        <span className="text-muted-foreground text-sm">
          {displayVillageName}
        </span>
        {!isLoading ? (
          <>
            <span className="text-muted-foreground text-sm">
              Total Specimens: {totalSpecimens}
              {isPartial && ' (partial)'}
            </span>
            <span className="text-muted-foreground text-sm">
              Total Images: {totalImages}
              {isPartial && ' (partial)'}
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
