'use client';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import type { Specimen } from '@/lib/entities/specimen/model';
import { ImageModal } from './image-modal';
import { useSpecimensQuery } from '@/lib/review/client/hooks/use-specimens';
import { useQueries } from '@tanstack/react-query';
import { reviewKeys } from '@/lib/review/keys';
import { getSpecimens } from '@/lib/review/client/get-specimens';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationFirst,
	PaginationLast,
} from '@/components/ui/pagination';

interface SpecimenReviewAccordionProps {
	siteIds: number[];
	houseNumbers: string[];
	district: string;
	startDate: string;
	endDate: string;
	pageSize: number;
}

export function SpecimenReviewAccordion({
	siteIds,
	houseNumbers,
	district,
	startDate,
	endDate,
	pageSize,
}: SpecimenReviewAccordionProps) {
	const [openItems, setOpenItems] = useState<string[]>([]);
	const [selectedImage, setSelectedImage] = useState<{
		url: string;
		specimenId: number;
	} | null>(null);

	// Track pagination state for each site
	const [sitePagination, setSitePagination] = useState<Record<number, number>>({});

	// Create a map of siteId to houseNumber
	const siteToHouseNumberMap = useMemo(() => {
		const map: Record<number, string> = {};
		siteIds.forEach((siteId, index) => {
			map[siteId] = houseNumbers[index] || `Site ${siteId}`;
		});
		return map;
	}, [siteIds, houseNumbers]);

	// Check which sites have specimens for this month
	const siteCheckQueries = useQueries({
		queries: siteIds.map(siteId => ({
			queryKey: reviewKeys.specimens(0, 1, startDate, endDate, district, siteId),
			queryFn: () => getSpecimens({
				district,
				startDate,
				endDate,
				siteId,
				offset: 0,
				limit: 1, // Only fetch 1 to check if site has any specimens
			}),
			enabled: Boolean(siteId && district && startDate && endDate),
		})),
	});

	// Filter to only sites that have specimens (total > 0)
	const sitesWithSpecimens = siteIds.filter((siteId, index) => {
		const query = siteCheckQueries[index];
		return query.data?.total && query.data.total > 0;
	});

	const isLoadingAnySite = siteCheckQueries.some(q => q.isLoading);

	const handleSitePageChange = (siteId: number, newPage: number) => {
		setSitePagination(prev => ({
			...prev,
			[siteId]: newPage,
		}));
	};

	if (isLoadingAnySite) {
		return (
			<div className="p-4 text-muted-foreground">
				Loading sites...
			</div>
		);
	}

	if (sitesWithSpecimens.length === 0) {
		return (
			<div className="p-4 text-muted-foreground">
				No sites with specimens found for this month
			</div>
		);
	}

	const getImageUrl = (specimen: Specimen): string | null => {
		if (specimen.thumbnailImageId) {
			return `/api/bff/specimens/${specimen.id}/images/${specimen.thumbnailImageId}`;
		}

		const relativePath = specimen.thumbnailImage?.url ?? specimen.thumbnailUrl;
		if (!relativePath) return null;
		if (relativePath.startsWith('http')) return relativePath;
		return `/api/bff${
			relativePath.startsWith('/') ? relativePath : `/${relativePath}`
		}`;
	};

	return (
		<>
			<Accordion
				type="multiple"
				className="w-full rounded-lg border"
				value={openItems}
				onValueChange={setOpenItems}
			>
				{sitesWithSpecimens.map((siteId) => {
					const isOpen = openItems.includes(String(siteId));
					const currentPage = sitePagination[siteId] || 1;
					const houseNumber = siteToHouseNumberMap[siteId];
					
					return (
						<AccordionItem
							key={siteId}
							value={String(siteId)}
							className="border-b last:border-b-0"
						>
							<AccordionTrigger className="px-4">
								House Number: {houseNumber}
								<span className="ml-2 text-sm text-muted-foreground">
									(Site ID: {siteId})
								</span>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								{isOpen && (
									<SiteSpecimens
										siteId={siteId}
										district={district}
										startDate={startDate}
										endDate={endDate}
										currentPage={currentPage}
										pageSize={pageSize}
										onImageClick={setSelectedImage}
										onPageChange={(newPage) => handleSitePageChange(siteId, newPage)}
										getImageUrl={getImageUrl}
									/>
								)}
							</AccordionContent>
						</AccordionItem>
					);
				})}
			</Accordion>

			{selectedImage && (
				<ImageModal
					imageUrl={selectedImage.url}
					specimenId={selectedImage.specimenId}
					isOpen={!!selectedImage}
					onClose={() => setSelectedImage(null)}
				/>
			)}
		</>
	);
}

interface SiteSpecimensProps {
	siteId: number;
	district: string;
	startDate: string;
	endDate: string;
	currentPage: number;
	pageSize: number;
	onImageClick: (image: { url: string; specimenId: number }) => void;
	onPageChange: (page: number) => void;
	getImageUrl: (specimen: Specimen) => string | null;
}

function SiteSpecimens({
	siteId,
	district,
	startDate,
	endDate,
	currentPage,
	pageSize,
	onImageClick,
	onPageChange,
	getImageUrl,
}: SiteSpecimensProps) {
	const { data, isLoading, isFetching } = useSpecimensQuery({
		district,
		startDate,
		endDate,
		siteId,
		offset: (currentPage - 1) * pageSize,
		limit: pageSize,
	});

	const specimens = data?.items ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.ceil(total / pageSize);

	const isPagingDisabled = isLoading || isFetching;

	// Generate page range
	const getPageRange = (): (number | 'ellipsis')[] => {
		const range: (number | 'ellipsis')[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				range.push(i);
			}
		} else {
			range.push(1);

			if (currentPage > 3) {
				range.push('ellipsis');
			}

			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				range.push(i);
			}

			if (currentPage < totalPages - 2) {
				range.push('ellipsis');
			}

			if (totalPages > 1) {
				range.push(totalPages);
			}
		}

		return range;
	};

	const pages = getPageRange();
	const canPrev = currentPage > 1;
	const canNext = currentPage < totalPages;

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
		if (!isPagingDisabled && currentPage < totalPages) {
			onPageChange(totalPages);
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

	if (isLoading) {
		return (
			<div className="p-4 text-sm text-muted-foreground">
				Loading specimens...
			</div>
		);
	}

	if (specimens.length === 0) {
		return (
			<div className="p-4 text-sm text-muted-foreground">
				No specimens found for this site
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<span>
					Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, total)} of {total} specimens
				</span>
			</div>

			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{specimens
					.filter(specimen => getImageUrl(specimen) !== null)
					.map((specimen) => {
						const imageUrl = getImageUrl(specimen)!;

						return (
							<div
								key={specimen.id}
								className="cursor-pointer rounded border p-2 transition-shadow hover:shadow-lg"
								onClick={() =>
									onImageClick({
										url: imageUrl,
										specimenId: specimen.id,
									})
								}
							>
								<div className="mb-1 text-xs text-muted-foreground">
									Specimen {specimen.id}
								</div>
								<Image
									src={imageUrl}
									alt={`Specimen ${specimen.id}`}
									width={240}
									height={180}
									className="h-auto w-full rounded object-cover"
								/>
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
										isPagingDisabled || currentPage === 1
											? 'pointer-events-none opacity-50'
											: ''
									}
									onClick={handleNavigateToFirstPage}
									href="#"
								/>
							</PaginationItem>
							{pages.map((pageItem, index) => (
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
										isPagingDisabled || currentPage === totalPages
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
	);
}



