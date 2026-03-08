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

export default function OperationsDetailPagination({
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
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onPrevious();
                            }}
                            aria-disabled={isFirstPage}
                            className={isFirstPage ? 'pointer-events-none opacity-50' : 'hover:bg-primary/10 cursor-pointer'}
                        />
                    </PaginationItem>

                    {pageRange.map((pageNum, idx) =>
                        pageNum === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${idx}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={pageNum}>
                                <PaginationLink
                                    href="#"
                                    isActive={page === pageNum}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPageChange(pageNum);
                                    }}
                                    className={page === pageNum ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-primary/10 cursor-pointer'}
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    )}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onNext();
                            }}
                            aria-disabled={isLastPage}
                            className={isLastPage ? 'pointer-events-none opacity-50' : 'hover:bg-primary/10 cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
