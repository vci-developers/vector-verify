'use client';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface OperationsDetailPaginationProps {
    page: number;
    totalPages: number;
    pageRange: (number | 'ellipsis')[];
    onPageChange: (page: number) => void;
    onPrevious: () => void;
    onNext: () => void;
}

export default function OperationsDataTablePagination({
    page,
    totalPages,
    pageRange,
    onPageChange,
    onPrevious,
    onNext,
}: OperationsDetailPaginationProps) {
    const isFirstPage = page === 1;
    const isLastPage = page === totalPages;

    return (
        <div className="flex flex-col items-center gap-4">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={onPrevious}
                            aria-disabled={isFirstPage}
                            className={
                                isFirstPage
                                    ? 'pointer-events-none opacity-50'
                                    : 'hover:bg-primary/10 cursor-pointer'
                            }
                        />
                    </PaginationItem>

                    {pageRange.map((pageNumber, index) =>
                        pageNumber === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={pageNumber}>
                                <PaginationLink
                                    isActive={page === pageNumber}
                                    onClick={() => onPageChange(pageNumber)}
                                    className={
                                        page === pageNumber
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : 'hover:bg-primary/10 cursor-pointer'
                                    }
                                >
                                    {pageNumber}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    )}

                    <PaginationItem>
                        <PaginationNext
                            onClick={onNext}
                            aria-disabled={isLastPage}
                            className={
                                isLastPage
                                    ? 'pointer-events-none opacity-50'
                                    : 'hover:bg-primary/10 cursor-pointer'
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
