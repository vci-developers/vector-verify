'use client';

import Image from 'next/image';
import { Specimen } from '@/lib/entities/specimen';
import { useSpecimensQuery } from '@/lib/review/client/hooks/use-specimens';
import { SpecimenGridLoadingSkeleton } from './loading-skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
} from '@/components/ui/pagination';
import { usePagination } from '@/lib/shared/hooks/use-pagination';
import { ImageOff } from 'lucide-react';
import { useEffect } from 'react';
import { SpecimenFilters } from './specimen-filters';

interface SiteSpecimenContentProps {
  siteId: number;
  district: string;
  startDate: string;
  endDate: string;
  currentPage: number;
  pageSize: number;
  isOpen: boolean;
  filters: SpecimenFilters;
  onImageClick: (specimen: Specimen) => void;
  onPageChange: (page: number) => void;
}

function getImageUrl(specimen: Specimen): string | null {
  if (specimen.thumbnailImageId) {
    return `/api/bff/specimens/${specimen.id}/images/${specimen.thumbnailImageId}`;
  }

  const relativePath = specimen.thumbnailImage?.url ?? specimen.thumbnailUrl;
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `/api/bff${
    relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  }`;
}

export function SiteSpecimenContent({
  siteId,
  district,
  startDate,
  endDate,
  currentPage,
  pageSize,
  isOpen,
  filters,
  onImageClick,
  onPageChange,
}: SiteSpecimenContentProps) {
  useEffect(() => {
    onPageChange(1);
  }, [filters.species, filters.sex, filters.abdomenStatus]);

  const { data, isLoading } = useSpecimensQuery({
    district,
    startDate,
    endDate,
    siteId,
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
    species: filters.species ?? undefined,
    sex: filters.sex ?? undefined,
    abdomenStatus: filters.abdomenStatus ?? undefined,
  });

  const specimens = data?.items ?? [];
  const total = data?.total ?? 0;

  const pagination = usePagination({
    initialTotal: total,
    initialPage: currentPage,
    initialPageSize: pageSize,
  });

  useEffect(() => {
    pagination.setTotal(total);
  }, [total]);

  useEffect(() => {
    pagination.setPageSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    pagination.setPage(currentPage);
  }, [currentPage]);

  const isPagingDisabled = isLoading;

  function handleNavigateToFirstPage(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && currentPage > 1) {
      onPageChange(1);
    }
  }

  function handleNavigateToLastPage(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && currentPage < pagination.totalPages) {
      onPageChange(pagination.totalPages);
    }
  }

  function handleNavigateToPage(
    event: React.MouseEvent<HTMLAnchorElement>,
    pageNumber: number,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && pageNumber !== currentPage) {
      onPageChange(pageNumber);
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
          {filters.species || filters.sex || filters.abdomenStatus
            ? 'No specimens match the selected filters'
            : 'No specimens reported from this household'}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, total)} of {total} specimens
              {filters.species || filters.sex || filters.abdomenStatus ? ' (filtered)' : ''}
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

          {pagination.totalPages > 1 && (
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
                  {pagination.range.map((pageItem, index) => (
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
                        isPagingDisabled || currentPage >= pagination.totalPages
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
