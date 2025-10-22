'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/accordion';

import { ImageModal } from './image-modal';
import { SiteSpecimenContent } from './site-specimens';
import type { Specimen } from '@/shared/entities/specimen';
import type { SpecimenFilters } from './specimen-filters';

interface SpecimenReviewAccordionProps {
  siteIds: number[];
  houseNumbers: string[];
  district: string;
  startDate: string;
  endDate: string;
  pageSize: number;
  filters: SpecimenFilters;
}

export function SpecimenReviewAccordion({
  siteIds,
  houseNumbers,
  district,
  startDate,
  endDate,
  pageSize,
  filters,
}: SpecimenReviewAccordionProps) {
  const [openItem, setOpenItem] = useState('');
  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(null);
  const [sitePagination, setSitePagination] = useState<Record<number, number>>({});

  useEffect(() => {
    setSitePagination({});
  }, [pageSize, filters]);

  const siteToHouseNumberMap = useMemo(() => {
    const map: Record<number, string> = {};
    siteIds.forEach((siteId, index) => {
      map[siteId] = houseNumbers[index] ?? `Site ${siteId}`;
    });
    return map;
  }, [siteIds, houseNumbers]);

  const handleSitePageChange = useCallback((siteId: number, page: number) => {
    setSitePagination(prev => ({ ...prev, [siteId]: page }));
  }, []);

  const accordionItems = useMemo(
    () =>
      siteIds.map(siteId => {
        const isOpen = openItem === String(siteId);
        const currentPage = sitePagination[siteId] ?? 1;
        const houseNumber = siteToHouseNumberMap[siteId];

        return (
          <AccordionItem
            key={siteId}
            value={String(siteId)}
            className="border-b last:border-b-0"
          >
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2">
                <span>{houseNumber}</span>
                <span className="text-sm text-muted-foreground">
                  (Site ID: {siteId})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <SiteSpecimenContent
                siteId={siteId}
                district={district}
                startDate={startDate}
                endDate={endDate}
                currentPage={currentPage}
                pageSize={pageSize}
                isOpen={isOpen}
                filters={filters}
                onImageClick={setSelectedSpecimen}
                onPageChange={handleSitePageChange}
              />
            </AccordionContent>
          </AccordionItem>
        );
      }),
    [
      siteIds,
      openItem,
      sitePagination,
      siteToHouseNumberMap,
      district,
      startDate,
      endDate,
      pageSize,
      filters,
      handleSitePageChange,
    ],
  );

  return (
    <Fragment>
      <Accordion
        type="single"
        collapsible
        className="w-full rounded-lg border"
        value={openItem}
        onValueChange={value => {
          setOpenItem(value);
          if (!value) {
            setSitePagination({});
          }
        }}
      >
        {accordionItems}
      </Accordion>

      {selectedSpecimen && (
        <ImageModal
          specimen={selectedSpecimen}
          onClose={() => setSelectedSpecimen(null)}
        />
      )}
    </Fragment>
  );
}
