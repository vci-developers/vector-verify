'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';

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

interface SiteSpecimenContentProps {
  siteId: number;
  queryParameters: SpecimensQuery;
  currentPage: number;
  pageSize: number;
  isOpen: boolean;
  onImageClick: (specimen: Specimen) => void;
  onPageChange: (siteId: number, page: number) => void;
}

function getImageUrl(specimen: Specimen): string | null {
  if (specimen.thumbnailImageId) {
    return `/api/bff/specimens/${specimen.id}/images/${specimen.thumbnailImageId}`;
  }

  const relativePath = specimen.thumbnailImage?.url ?? specimen.thumbnailUrl;
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `/api/bff${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
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

  useEffect(() => {
    if (isOpen) {
      onPageChange(siteId, 1);
    }
  }, [
    siteId,
    isOpen,
    onPageChange,
    district,
    startDate,
    endDate,
    species,
    sex,
    abdomenStatus,
  ]);

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

  const { setTotal, setPageSize, setPage, totalPages, createRange } = usePagination({
    initialTotal: total,
    initialPage: currentPage,
    initialPageSize: pageSize,
  });

  useEffect(() => {
    setTotal(total);
  }, [setTotal, total]);

  useEffect(() => {
    setPageSize(pageSize);
  }, [pageSize, setPageSize]);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage, setPage]);

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
            {specimens.map(specimen => {
              const imageUrl = getImageUrl(specimen);

              return (
                <div
                  key={specimen.id}
                  className="cursor-pointer overflow-hidden rounded border transition-shadow hover:shadow-lg"
                  onClick={() => imageUrl && onImageClick(specimen)}
                >
                  <div className="px-2 pt-2 text-xs text-muted-foreground">
                    {specimen.specimenId}
                  </div>
                  <div className="relative aspect-[4/3] w-full">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={`Specimen ${specimen.specimenId}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ImageOff className="h-8 w-8" />
                          <span className="text-xs">Invalid image</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
                  {createRange(currentPage).map((pageItem, index) => (
                    <PaginationItem
                      key={
                        pageItem === 'ellipsis'
                          ? `ellipsis-${index}`
                          : pageItem
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
