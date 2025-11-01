'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Specimen } from '@/shared/entities/specimen';
import { useSpecimensQuery } from '@/features/review/hooks/use-specimens';
import { usePagination } from '@/shared/core/hooks/use-pagination';
import { SpecimenGridLoadingSkeleton } from './loading-skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
} from '@/ui/pagination';
import type { SpecimensQuery } from '@/features/review/types';
import { SpecimenImage } from './specimen-image';

interface SiteSpecimenContentProps {
  siteId: number;
  queryParameters: SpecimensQuery;
  currentPage: number;
  pageSize: number;
  isOpen: boolean;
  onImageClick: (specimen: Specimen) => void;
  onPageChange: (siteId: number, page: number) => void;
}

export function SiteSpecimenContent({
  siteId,
  queryParameters,
  currentPage,
  pageSize,
  isOpen,
  onImageClick,
  onPageChange,
}: SiteSpecimenContentProps) {
  const { district, startDate, endDate, species, sex, abdomenStatus } =
    queryParameters;

  const prevIsOpenRef = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      onPageChange(siteId, 1);
    }
    prevIsOpenRef.current = isOpen;
    
  }, [isOpen, siteId]);

  const { data, isLoading } = useSpecimensQuery(
    {
      district,
      startDate,
      endDate,
      siteId,
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
      species: species ?? undefined,
      sex: sex ?? undefined,
      abdomenStatus: abdomenStatus ?? undefined,
    },
    { enabled: isOpen },
  );

  const specimens = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasActiveFilters = Boolean(species || sex || abdomenStatus);

  
  const { setTotal, setPageSize, totalPages, createRange } = usePagination({
    initialTotal: total,
    initialPageSize: pageSize,
  });

  useEffect(() => {
    setTotal(total);
  }, [setTotal, total]);

  useEffect(() => {
    setPageSize(pageSize);
  }, [pageSize, setPageSize]);

  const validCurrentPage = useMemo(() => {
    if (totalPages <= 0) return 1;
    return Math.min(Math.max(1, currentPage), totalPages);
  }, [currentPage, totalPages]);

  const isPagingDisabled = isLoading;

  function handleNavigateToFirstPage(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && currentPage > 1) {
      onPageChange(siteId, 1);
    }
  }

  function handleNavigateToLastPage(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && currentPage < totalPages) {
      onPageChange(siteId, totalPages);
    }
  }

  function handleNavigateToPage(
    event: React.MouseEvent<HTMLAnchorElement>,
    pageNumber: number,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && pageNumber !== currentPage) {
      onPageChange(siteId, pageNumber);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {isLoading ? (
        <SpecimenGridLoadingSkeleton />
      ) : total === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          {hasActiveFilters
            ? 'No specimens match the selected filters'
            : 'No specimens reported from this household'}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} –
              {` ${Math.min(currentPage * pageSize, total)} of ${total} specimens`}
              {hasActiveFilters ? ' (filtered)' : ''}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {specimens.map(specimen => (
              <SpecimenImage
                key={specimen.id}
                specimen={specimen}
                className="overflow-hidden rounded border transition-shadow hover:shadow-lg"
                onClick={() => {
                  const imageUrl =
                    specimen.thumbnailImageId ||
                    specimen.thumbnailImage?.url ||
                    specimen.thumbnailUrl;
                  if (imageUrl) onImageClick(specimen);
                }}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationFirst
                      className={
                        isPagingDisabled || currentPage <= 1
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                      onClick={handleNavigateToFirstPage}
                      href="#"
                    />
                  </PaginationItem>
                  {createRange(validCurrentPage).map((pageItem, index) => (
                    <PaginationItem
                      key={
                        pageItem === 'ellipsis' ? `ellipsis-${index}` : pageItem
                      }
                    >
                      {pageItem === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={pageItem === currentPage}
                          onClick={event => handleNavigateToPage(event, pageItem)}
                        >
                          {pageItem}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationLast
                      className={
                        isPagingDisabled || currentPage >= totalPages
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                      onClick={handleNavigateToLastPage}
                      href="#"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </>
  );
}
