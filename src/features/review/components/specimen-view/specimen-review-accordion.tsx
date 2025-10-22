'use client';

import {
	Accordion,
} from '@/ui/accordion';
import { useState, useMemo, Fragment, useEffect } from 'react';
import { ImageModal } from './image-modal';
import { SiteSpecimenAccordionItem } from './site-specimens';
import { Specimen } from '@/shared/entities/specimen';

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

	const [sitePagination, setSitePagination] = useState<Record<number, number>>({});

	useEffect(() => {
		setSitePagination({});
	}, [pageSize]);

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
				onValueChange={value => {
					setOpenItem(value);
					if (!value) {
						setSitePagination({});
					}
				}}
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
					onClose={() => setSelectedSpecimen(null)}
				/>
			)}
		</Fragment>
	);
}



