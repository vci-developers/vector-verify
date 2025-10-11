import Image from 'next/image';
import { Specimen } from "@/lib/entities/specimen";
import { useSpecimensQuery } from "@/lib/review/client/hooks/use-specimens";
import { SpecimenGridLoadingSkeleton } from "./loading-skeleton";
import { 
    Pagination, 
    PaginationContent, 
    PaginationEllipsis, 
    PaginationFirst, 
    PaginationItem, 
    PaginationLast, 
    PaginationLink 
} from "@/components/ui/pagination";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { usePagination } from '@/lib/shared/hooks/use-pagination';

interface SiteSpecimenAccordionItemProps {
    siteId: number;
    houseNumber: string;
    district: string;
    startDate: string;
    endDate: string;
    currentPage: number;
    pageSize: number;
    isOpen: boolean;
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

export function SiteSpecimenAccordionItem({
    siteId,
    houseNumber,
    district,
    startDate,
    endDate,
    currentPage,
    pageSize,
    isOpen,
    onImageClick,
    onPageChange,
}: SiteSpecimenAccordionItemProps) {
    // Fetch specimens for this site - always call hook
    const { data, isLoading } = useSpecimensQuery({
        district,
        startDate,
        endDate,
        siteId,
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
    });

    const specimens = data?.items ?? [];
    const total = data?.total ?? 0;
    
    // Use pagination hook unconditionally
    const pagination = usePagination({
        initialTotal: total,
        initialPage: currentPage,
        initialPageSize: pageSize,
    });
    
    // Filter specimens that have images
    const specimensWithImages = specimens.filter(specimen => getImageUrl(specimen) !== null);
    
    const isPagingDisabled = isLoading;
    
    // Check if we should hide this accordion item
    const shouldHide = !isLoading && specimensWithImages.length === 0 && currentPage === 1;

    function handleNavigateToFirstPage(
        event: React.MouseEvent<HTMLAnchorElement>,
    ) {
        event.preventDefault();
        if (!isPagingDisabled && pagination.canPrev) {
            onPageChange(1);
        }
    }

    function handleNavigateToLastPage(
        event: React.MouseEvent<HTMLAnchorElement>,
    ) {
        event.preventDefault();
        if (!isPagingDisabled && pagination.canNext) {
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

    // Don't render accordion item if no specimens with images
    if (shouldHide) {
        return null;
    }

    return (
        <AccordionItem
            value={String(siteId)}
            className="border-b last:border-b-0"
        >
            <AccordionTrigger className="px-4">
                {houseNumber}
                <span className="ml-2 text-sm text-muted-foreground">
                    (Site ID: {siteId})
                </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
                {isOpen && (
                    <>
                        {isLoading ? (
                            <SpecimenGridLoadingSkeleton />
                        ) : specimensWithImages.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground">
                                No specimens with images found for this site
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>
                                        Showing {pagination.start + 1} - {Math.min(pagination.end, total)} of {total} specimens
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    {specimensWithImages.map((specimen) => {
                                        const imageUrl = getImageUrl(specimen)!;

                                        return (
                                            <div
                                                key={specimen.id}
                                                className="cursor-pointer rounded border p-2 transition-shadow hover:shadow-lg"
                                                onClick={() => onImageClick(specimen)}
                                            >
                                                <div className="mb-1 text-xs text-muted-foreground">
                                                    {specimen.specimenId}
                                                </div>
                                                <Image
                                                    src={imageUrl}
                                                    alt={`Specimen ${specimen.specimenId}`}
                                                    width={240}
                                                    height={180}
                                                    className="h-auto w-full rounded object-cover"
                                                    unoptimized
                                                />
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
                                                            isPagingDisabled || !pagination.canPrev
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
                                                            isPagingDisabled || !pagination.canNext
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
                )}
            </AccordionContent>
        </AccordionItem>
    );
}