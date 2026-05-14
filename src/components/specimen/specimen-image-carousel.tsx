'use client';

import type { SpecimenImageCarouselItem } from '@/lib/specimen/specimen-image-carousel-items';
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

interface SpecimenImageCarouselProps {
    specimenId: string;
    images: SpecimenImageCarouselItem[];
    currentImageIndex: number;
    onCurrentImageIndexChange: (index: number) => void;
    emptyLabel: string;
    secondaryCounterText?: string;
    mainImageContainerClassName?: string;
    mainImageSizes?: string;
    thumbnailButtonClassName?: string;
    thumbnailImageSizes?: string;
}

export default function SpecimenImageCarousel({
    specimenId,
    images,
    currentImageIndex,
    onCurrentImageIndexChange,
    emptyLabel,
    secondaryCounterText,
    mainImageContainerClassName = 'bg-muted relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-lg border',
    mainImageSizes = '(min-width: 1024px) 60vw, 100vw',
    thumbnailButtonClassName = 'relative h-20 w-28 shrink-0 overflow-hidden rounded-md border p-0 hover:bg-transparent',
    thumbnailImageSizes = '112px',
}: SpecimenImageCarouselProps) {
    const [imageViewerApi, setImageViewerApi] = useState<CarouselApi>();
    const [thumbnailStripApi, setThumbnailStripApi] = useState<CarouselApi>();
    const [canScrollThumbnailsLeft, setCanScrollThumbnailsLeft] =
        useState(false);
    const [canScrollThumbnailsRight, setCanScrollThumbnailsRight] =
        useState(false);

    const hasAnyImages = images.length > 0;
    const hasMultipleImages = images.length > 1;
    const activeImageIndex = hasAnyImages
        ? Math.min(Math.max(currentImageIndex, 0), images.length - 1)
        : 0;
    const currentImage = images[activeImageIndex];
    const showThumbnailScrollControls =
        canScrollThumbnailsLeft || canScrollThumbnailsRight;

    useEffect(() => {
        if (!hasAnyImages) return;
        if (currentImageIndex >= 0 && currentImageIndex < images.length) return;

        onCurrentImageIndexChange(0);
    }, [
        currentImageIndex,
        hasAnyImages,
        images.length,
        onCurrentImageIndexChange,
    ]);

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
    }, [imageViewerApi, onCurrentImageIndexChange, thumbnailStripApi]);

    useEffect(() => {
        if (!imageViewerApi) return;
        if (imageViewerApi.selectedScrollSnap() === activeImageIndex) return;

        imageViewerApi.scrollTo(activeImageIndex);
    }, [activeImageIndex, imageViewerApi]);

    useEffect(() => {
        thumbnailStripApi?.scrollTo(activeImageIndex);
    }, [activeImageIndex, thumbnailStripApi]);

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
            <div
                className={cn(
                    mainImageContainerClassName,
                    'flex items-center justify-center',
                )}
            >
                <p className="text-muted-foreground text-sm">{emptyLabel}</p>
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
                        {images.map(image => (
                            <CarouselItem key={image.id}>
                                <div className={mainImageContainerClassName}>
                                    <Image
                                        src={`/api${image.url}`}
                                        alt={`Specimen ${specimenId}`}
                                        fill
                                        unoptimized
                                        sizes={mainImageSizes}
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

                {currentImage?.isThumbnail && (
                    <Badge
                        variant="secondary"
                        className="absolute top-3 left-3 shadow-md"
                    >
                        <Star className="fill-current" />
                        Thumbnail
                    </Badge>
                )}
            </div>

            <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-sm">
                    Image {activeImageIndex + 1} of {images.length}
                </p>
                {secondaryCounterText && (
                    <p className="text-muted-foreground text-sm">
                        {secondaryCounterText}
                    </p>
                )}
            </div>

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
                            {images.map((image, imageIndex) => (
                                <CarouselItem
                                    key={image.id}
                                    className="basis-auto pl-2"
                                >
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            onCurrentImageIndexChange(
                                                imageIndex,
                                            );
                                            imageViewerApi?.scrollTo(
                                                imageIndex,
                                            );
                                        }}
                                        className={cn(
                                            thumbnailButtonClassName,
                                            imageIndex === activeImageIndex
                                                ? 'border-primary ring-primary/30 ring-2'
                                                : 'border-border hover:border-foreground/40',
                                        )}
                                        aria-label={
                                            image.isThumbnail
                                                ? `Show image ${imageIndex + 1} (thumbnail)`
                                                : `Show image ${imageIndex + 1}`
                                        }
                                        aria-current={
                                            imageIndex === activeImageIndex
                                                ? 'true'
                                                : undefined
                                        }
                                    >
                                        <Image
                                            src={`/api${image.url}`}
                                            alt=""
                                            fill
                                            unoptimized
                                            sizes={thumbnailImageSizes}
                                            className="object-cover"
                                        />
                                        {image.isThumbnail && (
                                            <Star className="bg-background/90 absolute top-1 left-1 size-5 rounded-full fill-current p-1 shadow-md" />
                                        )}
                                    </Button>
                                </CarouselItem>
                            ))}
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
