'use client';

import { useGetAllPaginatedSpecimens } from '@/api/specimen/hooks/use-get-all-paginated-specimens';
import type { GetSpecimensQueryParams } from '@/api/specimen/validation/get-specimens-schema';
import SpecimenImageReviewCarousel from '@/features/review/components/site-detail/specimen-image-review/specimen-image-review-carousel';
import { buildSpecimenReviewImages } from '@/features/review/utils/specimen-image-review-data';
import { ImageIcon } from 'lucide-react';
import { useMemo } from 'react';

interface SpecimenImageReviewWorkspaceProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
}

export default function SpecimenImageReviewWorkspace({
    siteId,
    startDate,
    endDate,
}: SpecimenImageReviewWorkspaceProps) {
    const getSpecimensQueryParams = useMemo<GetSpecimensQueryParams>(
        () => ({
            siteId,
            startDate,
            endDate,
            sessionType: 'SURVEILLANCE',
            hasImages: true,
            includeAllImages: true,
        }),
        [endDate, siteId, startDate],
    );

    const {
        data: getAllPaginatedSpecimensResult,
        isPending: isGetAllPaginatedSpecimensPending,
    } = useGetAllPaginatedSpecimens(getSpecimensQueryParams);

    const reviewHeader = (
        <div>
            <h2 className="text-lg font-semibold">Step 2: Image Review</h2>
            <p className="text-muted-foreground text-sm">
                Review specimen images from all sessions in this period.
            </p>
        </div>
    );

    if (isGetAllPaginatedSpecimensPending || !getAllPaginatedSpecimensResult) {
        return (
            <div className="space-y-4">
                {reviewHeader}

                <div className="bg-muted flex aspect-[16/9] min-h-96 items-center justify-center rounded-lg border">
                    <p className="text-muted-foreground text-sm">
                        Loading specimen images...
                    </p>
                </div>
            </div>
        );
    }

    if (!getAllPaginatedSpecimensResult.ok) {
        return (
            <div className="space-y-4">
                {reviewHeader}

                <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
                    {getAllPaginatedSpecimensResult.error.message}
                </div>
            </div>
        );
    }

    const images = buildSpecimenReviewImages(
        getAllPaginatedSpecimensResult.data.specimens,
    );

    if (images.length === 0) {
        return (
            <div className="space-y-4">
                {reviewHeader}

                <div className="bg-muted/40 flex min-h-96 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <ImageIcon className="text-muted-foreground/70 mb-3 h-10 w-10" />
                    <h3 className="text-base font-semibold">
                        No specimen images found
                    </h3>
                    <p className="text-muted-foreground mt-1 max-w-md text-sm">
                        There are no specimen images for this site in the
                        selected review period.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviewHeader}

            <SpecimenImageReviewCarousel images={images} />
        </div>
    );
}
