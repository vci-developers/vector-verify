'use client';

import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
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
import {
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    RotateCcw,
    Star,
} from 'lucide-react';
import SignedSpecimenImage from '@/components/specimen/signed-specimen-image';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';

const ZOOM_STEP = 0.5;
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

interface SpecimenImageCarouselProps {
    specimen: Specimen;
    onCurrentImageChange?: (image: SpecimenImage | null) => void;
}

function isThumbnailImage(specimen: Specimen, image: SpecimenImage) {
    return (
        image.id === specimen.thumbnailImageId ||
        image.id === specimen.thumbnailImage?.id ||
        image.url === specimen.thumbnailUrl
    );
}

export default function SpecimenImageCarousel({
    specimen,
    onCurrentImageChange,
}: SpecimenImageCarouselProps) {
    const [imageViewerApi, setImageViewerApi] = useState<CarouselApi>();
    const [thumbnailStripApi, setThumbnailStripApi] = useState<CarouselApi>();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [canScrollThumbnailsLeft, setCanScrollThumbnailsLeft] =
        useState(false);
    const [canScrollThumbnailsRight, setCanScrollThumbnailsRight] =
        useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const dragStateRef = useRef<{
        startX: number;
        startY: number;
        startPanX: number;
        startPanY: number;
    }>(null);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const clampPanOffset = (offset: { x: number; y: number }, zoom: number) => {
        if (!containerRef.current || zoom <= MIN_ZOOM) {
            return { x: 0, y: 0 };
        }

        const { width, height } = containerRef.current.getBoundingClientRect();
        const maxX = ((width * (zoom - 1)) / 2) * 0.75;
        const maxY = ((height * (zoom - 1)) / 2) * 0.75;
        return {
            x: Math.min(maxX, Math.max(-maxX, offset.x)),
            y: Math.min(maxY, Math.max(-maxY, offset.y)),
        };
    };

    const handleZoomIn = () => {
        setZoomLevel(current => Math.min(MAX_ZOOM, current + ZOOM_STEP));
    };

    const handleZoomOut = () => {
        setZoomLevel(current => {
            const next = Math.max(MIN_ZOOM, current - ZOOM_STEP);
            setPanOffset(previous => clampPanOffset(previous, next));
            return next;
        });
    };

    const handleZoomReset = () => {
        setZoomLevel(MIN_ZOOM);
        setPanOffset({ x: 0, y: 0 });
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (zoomLevel <= MIN_ZOOM) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        dragStateRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            startPanX: panOffset.x,
            startPanY: panOffset.y,
        };
        setIsDragging(true);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragStateRef.current) return;
        const dx = event.clientX - dragStateRef.current.startX;
        const dy = event.clientY - dragStateRef.current.startY;
        setPanOffset(
            clampPanOffset(
                {
                    x: dragStateRef.current.startPanX + dx,
                    y: dragStateRef.current.startPanY + dy,
                },
                zoomLevel,
            ),
        );
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragStateRef.current) return;
        event.currentTarget.releasePointerCapture(event.pointerId);
        dragStateRef.current = null;
        setIsDragging(false);
    };

    const allImagesForSpecimen = useMemo(() => {
        const allImages = specimen.images ?? [];
        const thumbnailImageId =
            specimen.thumbnailImageId ?? specimen.thumbnailImage?.id ?? null;
        const thumbnailImageFromList =
            thumbnailImageId != null
                ? allImages.find(image => image.id === thumbnailImageId)
                : undefined;
        const thumbnailImage =
            thumbnailImageFromList ??
            specimen.thumbnailImage ??
            (specimen.thumbnailUrl
                ? {
                      id: thumbnailImageId ?? -1,
                      url: specimen.thumbnailUrl,
                      species: null,
                      sex: null,
                      abdomenStatus: null,
                  }
                : null);

        if (!thumbnailImage) {
            return allImages;
        }

        return [
            thumbnailImage,
            ...allImages.filter(
                image =>
                    image.id !== thumbnailImage.id &&
                    image.url !== thumbnailImage.url,
            ),
        ];
    }, [specimen]);

    const hasAnyImages = allImagesForSpecimen.length > 0;
    const hasMultipleImages = allImagesForSpecimen.length > 1;
    const currentImage = allImagesForSpecimen[currentImageIndex];
    const isCurrentImageThumbnail = currentImage
        ? isThumbnailImage(specimen, currentImage)
        : false;
    const showThumbnailScrollControls =
        canScrollThumbnailsLeft || canScrollThumbnailsRight;

    useEffect(() => {
        if (!imageViewerApi) return;

        onCurrentImageChange?.(allImagesForSpecimen[0] ?? null);

        const handleImageViewerSelect = () => {
            const newImageIndex = imageViewerApi.selectedScrollSnap();
            setCurrentImageIndex(newImageIndex);
            onCurrentImageChange?.(allImagesForSpecimen[newImageIndex] ?? null);
            thumbnailStripApi?.scrollTo(newImageIndex);
            setZoomLevel(1);
            setPanOffset({ x: 0, y: 0 });
        };

        imageViewerApi.on('select', handleImageViewerSelect);
        return () => {
            imageViewerApi.off('select', handleImageViewerSelect);
        };
    }, [
        allImagesForSpecimen,
        imageViewerApi,
        onCurrentImageChange,
        thumbnailStripApi,
    ]);

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

    useEffect(() => {
        if (!imageViewerApi) return;

        imageViewerApi.reInit({
            loop: hasMultipleImages,
            watchDrag: zoomLevel === 1,
        });
    }, [imageViewerApi, hasMultipleImages, zoomLevel]);

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
                        {allImagesForSpecimen.map((image, imageIndex) => {
                            const isCurrentSlide =
                                imageIndex === currentImageIndex;
                            return (
                                <CarouselItem key={image.id}>
                                    <div
                                        ref={
                                            isCurrentSlide
                                                ? containerRef
                                                : undefined
                                        }
                                        className={cn(
                                            'bg-muted user-select:none relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-lg border',
                                            zoomLevel > MIN_ZOOM &&
                                                'touch-none',
                                        )}
                                        onPointerDown={
                                            isCurrentSlide
                                                ? handlePointerDown
                                                : undefined
                                        }
                                        onPointerMove={
                                            isCurrentSlide
                                                ? handlePointerMove
                                                : undefined
                                        }
                                        onPointerUp={
                                            isCurrentSlide
                                                ? handlePointerUp
                                                : undefined
                                        }
                                    >
                                        <SignedSpecimenImage
                                            path={image.url}
                                            alt={`Specimen ${specimen.specimenId}`}
                                            fill
                                            sizes="(min-width: 1024px) 60vw, 100vw"
                                            className={cn(
                                                'object-contain',
                                                isCurrentSlide &&
                                                    zoomLevel > MIN_ZOOM &&
                                                    (isDragging
                                                        ? 'cursor-grabbing'
                                                        : 'cursor-grab'),
                                            )}
                                            style={
                                                isCurrentSlide
                                                    ? {
                                                          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                                                          transition: isDragging
                                                              ? 'none'
                                                              : 'transform 0.15s ease-out',
                                                      }
                                                    : undefined
                                            }
                                        />
                                    </div>
                                </CarouselItem>
                            );
                        })}
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

            <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-sm">
                    Image {currentImageIndex + 1} of{' '}
                    {allImagesForSpecimen.length}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= MIN_ZOOM}
                        aria-label="Zoom out"
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleZoomReset}
                        disabled={zoomLevel === MIN_ZOOM}
                        aria-label="Reset zoom"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span className="leading-none">Reset</span>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= MAX_ZOOM}
                        aria-label="Zoom in"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
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
                            {allImagesForSpecimen.map((image, imageIndex) => {
                                const isCurrentThumbnailImage =
                                    isThumbnailImage(specimen, image);

                                return (
                                    <CarouselItem
                                        key={image.id}
                                        className="basis-auto pl-2"
                                    >
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => {
                                                imageViewerApi?.scrollTo(
                                                    imageIndex,
                                                );
                                            }}
                                            className={cn(
                                                'relative h-20 w-28 shrink-0 overflow-hidden rounded-md border p-0 hover:bg-transparent',
                                                imageIndex === currentImageIndex
                                                    ? 'border-primary ring-primary/30 ring-2'
                                                    : 'border-border hover:border-foreground/40',
                                            )}
                                            aria-label={
                                                isCurrentThumbnailImage
                                                    ? `Show image ${imageIndex + 1} (thumbnail)`
                                                    : `Show image ${imageIndex + 1}`
                                            }
                                            aria-current={
                                                imageIndex === currentImageIndex
                                                    ? 'true'
                                                    : undefined
                                            }
                                        >
                                            <SignedSpecimenImage
                                                path={image.url}
                                                alt=""
                                                fill
                                                sizes="112px"
                                                className="object-cover"
                                            />
                                            {isCurrentThumbnailImage && (
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
