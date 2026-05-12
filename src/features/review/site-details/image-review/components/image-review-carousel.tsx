'use client';

import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Image from 'next/image';
import { Fragment, useEffect, useState } from 'react';

interface ImageReviewCarouselProps {
    specimen: Specimen;
    currentImageIndex: number;
    onCurrentImageIndexChange: (index: number) => void;
}

export default function ImageReviewCarousel({
    specimen,
    currentImageIndex,
    onCurrentImageIndexChange,
}: ImageReviewCarouselProps) {
    const [imageViewerApi, setImageViewerApi] = useState<CarouselApi>();
    const [thumbnailStripApi, setThumbnailStripApi] = useState<CarouselApi>();
    const [canScrollThumbnailsLeft, setCanScrollThumbnailsLeft] =
        useState(false);
    const [canScrollThumbnailsRight, setCanScrollThumbnailsRight] =
        useState(false);

    const allImagesForSpecimen = specimen.images ?? [];
    const hasAnyImages = allImagesForSpecimen.length > 0;
    const hasMultipleImages = allImagesForSpecimen.length > 1;
    const currentImage = allImagesForSpecimen[currentImageIndex];
    const isCurrentImageThumbnail =
        currentImage?.id === specimen.thumbnailImageId;
    const showThumbnailScrollControls =
        canScrollThumbnailsLeft || canScrollThumbnailsRight;

    useEffect(() => {
        if (!imageViewerApi) return;
        const handleImageViewerSelect = () => {
            const newImageIndex = imageViewerApi.selectedScrollSnap();
            onCurrentImageIndexChange(newImageIndex);
            thumbnailStripApi?.scrollTo(newImageIndex);
        };
        imageViewerApi.on('select', handleImageViewerSelect);
        return () => {
            imageViewerApi.off('select', handleImageViewerSelect);
        };
    }, [imageViewerApi, thumbnailStripApi, onCurrentImageIndexChange]);

    useEffect(() => {
        if (!imageViewerApi) return;
        if (imageViewerApi.selectedScrollSnap() === currentImageIndex) return;
        imageViewerApi.scrollTo(currentImageIndex);
    }, [imageViewerApi, currentImageIndex]);

    useEffect(() => {
        if (!thumbnailStripApi) return;
        const updateThumbnailScrollState = () => {
            setCanScrollThumbnailsLeft(thumbnailStripApi.canScrollPrev());
            setCanScrollThumbnailsRight(thumbnailStripApi.canScrollNext());
        };
        updateThumbnailScrollState();

        thumbnailStripApi.on('select', updateThumbnailScrollState);
        thumbnailStripApi.on('reInit', updateThumbnailScrollState);
        thumbnailStripApi.on('scroll', updateThumbnailScrollState);
        return () => {
            thumbnailStripApi.off('select', updateThumbnailScrollState);
            thumbnailStripApi.off('reInit', updateThumbnailScrollState);
            thumbnailStripApi.off('scroll', updateThumbnailScrollState);
        };
    }, [thumbnailStripApi]);

    if (!hasAnyImages) {
        return (
            <div className="bg-muted flex aspect-4/3 items-center justify-center rounded-lg border">
                <p className="text-muted-foreground text-sm">
                    No image has been uploaded for this specimen.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Carousel
                    setApi={setImageViewerApi}
                    opts={{ loop: hasMultipleImages }}
                    aria-label="Specimen image carousel"
                >
                    <CarouselContent>
                        {allImagesForSpecimen.map(image => (
                            <CarouselItem key={image.id}>
                                <div className="bg-muted relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-lg border">
                                    <Image
                                        src={`/api${image.url}`}
                                        alt={`Specimen ${specimen.specimenId}`}
                                        fill
                                        unoptimized
                                        sizes="(min-width: 1024px) 60vw, 100vw"
                                        className="object-contain"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {hasMultipleImages && (
                        <Fragment>
                            <CarouselPrevious className="left-4" />
                            <CarouselNext className="right-4" />
                        </Fragment>
                    )}
                </Carousel>

                {isCurrentImageThumbnail && (
                    <Badge
                        variant="secondary"
                        className="absolute top-3 left-3 shadow-md"
                    >
                        <Star className="fill-current" />
                        Thumbnail
                    </Badge>
                )}
            </div>

            <p className="text-muted-foreground text-right text-sm">
                Image {currentImageIndex + 1} of {allImagesForSpecimen.length}
            </p>

            {hasMultipleImages && (
                <div className="flex items-center gap-2">
                    {showThumbnailScrollControls && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => thumbnailStripApi?.scrollPrev()}
                            disabled={!canScrollThumbnailsLeft}
                            aria-label="Scroll thumbnails left"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <Carousel
                        setApi={setThumbnailStripApi}
                        opts={{
                            containScroll: 'keepSnaps',
                            dragFree: true,
                        }}
                        className="flex-1"
                        aria-label="Image thumbnails"
                    >
                        <CarouselContent className="-ml-2">
                            {allImagesForSpecimen.map((image, imageIndex) => {
                                const isThumbnailImage =
                                    image.id === specimen.thumbnailImageId;

                                return (
                                    <CarouselItem
                                        key={image.id}
                                        className="basis-auto pl-2"
                                    >
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() =>
                                                imageViewerApi?.scrollTo(
                                                    imageIndex,
                                                )
                                            }
                                            className={cn(
                                                'relative h-20 w-28 shrink-0 overflow-hidden rounded-md border p-0 hover:bg-transparent',
                                                imageIndex === currentImageIndex
                                                    ? 'border-primary ring-primary/30 ring-2'
                                                    : 'border-border hover:border-foreground/40',
                                            )}
                                            aria-label={
                                                isThumbnailImage
                                                    ? `Show image ${imageIndex + 1} (thumbnail)`
                                                    : `Show image ${imageIndex + 1}`
                                            }
                                            aria-current={
                                                imageIndex === currentImageIndex
                                                    ? 'true'
                                                    : undefined
                                            }
                                        >
                                            <Image
                                                src={`/api${image.url}`}
                                                alt=""
                                                fill
                                                unoptimized
                                                sizes="112px"
                                                className="object-cover"
                                            />
                                            {isThumbnailImage && (
                                                <Star className="bg-background/90 absolute top-1 left-1 size-5 rounded-full fill-current p-1 shadow-md" />
                                            )}
                                        </Button>
                                    </CarouselItem>
                                );
                            })}
                        </CarouselContent>
                    </Carousel>
                    {showThumbnailScrollControls && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => thumbnailStripApi?.scrollNext()}
                            disabled={!canScrollThumbnailsRight}
                            aria-label="Scroll thumbnails right"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
