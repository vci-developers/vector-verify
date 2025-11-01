'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationFirst,
  PaginationLast,
} from '@/ui/pagination';

interface TablePaginationProps {
  page: number;
  totalPages: number;
  pages: (number | 'ellipsis')[];
  isPagingDisabled: boolean;
  onNavigateToFirstPage: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onNavigateToLastPage: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onNavigateToPage: (
    event: React.MouseEvent<HTMLAnchorElement>,
    pageNumber: number,
  ) => void;
}

export function TablePagination({
  page,
  totalPages,
  pages,
  isPagingDisabled,
  onNavigateToFirstPage,
  onNavigateToLastPage,
  onNavigateToPage,
}: TablePaginationProps) {
  return (
    <div className="mt-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationFirst
              className={
                isPagingDisabled || page === 1
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
              onClick={onNavigateToFirstPage}
              href="#"
            />
          </PaginationItem>
          {pages.map((pageItem, index) => (
            <PaginationItem
              key={pageItem === 'ellipsis' ? `ellipsis-${index}` : pageItem}
            >
              {pageItem === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={pageItem === page}
                  onClick={event => onNavigateToPage(event, pageItem)}
                >
                  {pageItem}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationLast
              className={
                isPagingDisabled || page === totalPages
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
              onClick={onNavigateToLastPage}
              href="#"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
