'use client';

import {
	Accordion,
} from '@/components/ui/accordion';
import { useState, useMemo, Fragment } from 'react';
import { ImageModal } from './image-modal';
import { SiteSpecimenAccordionItem } from './site-specimens';
import { Specimen } from '@/lib/entities/specimen';

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
	const [openItem, setOpenItem] = useState<string>('');
	const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(null);

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

	const handleSitePageChange = (siteId: number, newPage: number) => {
		setSitePagination(prev => ({
			...prev,
			[siteId]: newPage,
		}));
	};

	return (
		<Fragment>
			<Accordion
				type="single"
				collapsible
				className="w-full rounded-lg border"
				value={openItem}
				onValueChange={setOpenItem}
			>
				{siteIds.map((siteId) => {
					const isOpen = openItem === String(siteId);
					const currentPage = sitePagination[siteId] || 1;
					const houseNumber = siteToHouseNumberMap[siteId];
					
					return (
						<SiteSpecimenAccordionItem
							key={siteId}
							siteId={siteId}
							houseNumber={houseNumber}
							district={district}
							startDate={startDate}
							endDate={endDate}
							currentPage={currentPage}
							pageSize={pageSize}
							isOpen={isOpen}
							onImageClick={setSelectedSpecimen}
							onPageChange={(newPage) => handleSitePageChange(siteId, newPage)}
						/>
					);
				})}
			</Accordion>

			{selectedSpecimen && (
				<ImageModal
					specimen={selectedSpecimen}
					isOpen={!!selectedSpecimen}
					onClose={() => setSelectedSpecimen(null)}
				/>
			)}
		</Fragment>
	);
}




