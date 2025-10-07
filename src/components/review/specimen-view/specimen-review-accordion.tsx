'use client';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';
import { useState } from 'react';
import type { Specimen } from '@/lib/entities/specimen/model';
import { ImageModal } from './image-modal';

interface SpecimenReviewAccordionProps {
	specimens: Specimen[];
}

export function SpecimenReviewAccordion({
	specimens,
}: SpecimenReviewAccordionProps) {
	const [openItems, setOpenItems] = useState<string[]>([]);
	const [selectedImage, setSelectedImage] = useState<{
		url: string;
		specimenId: number;
	} | null>(null);

	const specimensByHouseNumber = specimens.reduce(
		(acc, specimen) => {
			const houseNumber = specimen.session?.site?.houseNumber || 'Unknown';
			if (!acc[houseNumber]) {
				acc[houseNumber] = [];
			}
			acc[houseNumber].push(specimen);
			return acc;
		},
		{} as Record<string, typeof specimens>
	);

	const houseNumbers = Object.keys(specimensByHouseNumber).sort();

	if (houseNumbers.length === 0) {
		return (
			<div className="p-4 text-muted-foreground">
				No specimens found for this month
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
				{houseNumbers.map((houseNumber) => (
					<AccordionItem
						key={houseNumber}
						value={houseNumber}
						className="border-b last:border-b-0"
					>
						<AccordionTrigger className="px-4">
							House Number: {houseNumber}
						</AccordionTrigger>
						<AccordionContent className="px-4 pb-4">
							<div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
								{specimensByHouseNumber[houseNumber].map((specimen) => {
									const imageUrl = getImageUrl(specimen);
									if (!imageUrl) return null;

									return (
										<div
											key={specimen.id}
											className="cursor-pointer rounded border p-2 transition-shadow hover:shadow-lg"
											onClick={() =>
												setSelectedImage({
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
						</AccordionContent>
					</AccordionItem>
				))}
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



