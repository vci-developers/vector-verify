import { Button } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SpecimensTablePaginationProps {
    total: number;
    page: number;
    totalPages: number;
    pageRange: (number | 'ellipsis')[];
    onPageChange: (page: number) => void;
}

export default function SpecimensTablePagination({
    total,
    page,
    totalPages,
    pageRange,
    onPageChange,
}: SpecimensTablePaginationProps) {
    const t = useTranslations('ReviewSpecimens');

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-muted-foreground flex flex-wrap gap-x-3 text-sm">
                <span>{t('total', { count: total })}</span>
                <span>{t('pageOfTotal', { page, total: totalPages })}</span>
            </div>
            <Pagination
                aria-label={t('paginationLabel')}
                className="mx-0 w-auto"
            >
                <PaginationContent>
                    <PaginationItem>
                        <Button
                            variant="ghost"
                            disabled={page <= 1}
                            onClick={() => onPageChange(page - 1)}
                        >
                            <ChevronLeft aria-hidden="true" />
                            {t('previous')}
                        </Button>
                    </PaginationItem>
                    {pageRange.map((pageNumber, index) => (
                        <PaginationItem
                            key={
                                pageNumber === 'ellipsis'
                                    ? `ellipsis-${index}`
                                    : pageNumber
                            }
                        >
                            {pageNumber === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    isActive={page === pageNumber}
                                    aria-label={t('goToPage', {
                                        page: pageNumber,
                                    })}
                                    onClick={event => {
                                        event.preventDefault();
                                        onPageChange(pageNumber);
                                    }}
                                >
                                    {pageNumber}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <Button
                            variant="ghost"
                            disabled={page >= totalPages}
                            onClick={() => onPageChange(page + 1)}
                        >
                            {t('next')}
                            <ChevronRight aria-hidden="true" />
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
