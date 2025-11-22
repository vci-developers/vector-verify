'use client';

import { AccordionTrigger } from '@/ui/accordion';
import { formatHouseNumber } from './utils';
import type { SiteStatisticsData } from '@/features/review/types';

interface SiteAccordionTriggerProps {
  siteId: number;
  houseNumber: string;
  villageName?: string | null;
  statistics?: SiteStatisticsData;
}

export function SiteAccordionTrigger({
  siteId,
  houseNumber,
  villageName,
  statistics,
}: SiteAccordionTriggerProps) {
  const { totalSpecimens, totalImages, isLoading, isPartial } = statistics ?? {
    totalSpecimens: 0,
    totalImages: 0,
    isLoading: true,
    isPartial: false,
  };

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
