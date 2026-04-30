'use client';

import { Button } from '@/components/ui/button';
import type { SpecimenReviewImage } from '@/features/review/utils/specimen-image-review-data';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, type KeyboardEvent } from 'react';

interface SpecimenImageReviewCarouselProps {
    images: SpecimenReviewImage[];
}

export default function SpecimenImageReviewCarousel({
    images,
}: SpecimenImageReviewCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const activeImage = images[activeIndex];
    const hasMultipleImages = images.length > 1;

    useEffect(() => {
        if (activeIndex >= images.length) {
            setActiveIndex(Math.max(images.length - 1, 0));
        }
    }, [activeIndex, images.length]);

    if (!activeImage) return null;

    function showPreviousImage() {
        setActiveIndex(currentIndex =>
            currentIndex === 0 ? images.length - 1 : currentIndex - 1,
        );
    }

    function showNextImage() {
        setActiveIndex(currentIndex =>
            currentIndex === images.length - 1 ? 0 : currentIndex + 1,
        );
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (!hasMultipleImages) return;

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            showPreviousImage();
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            showNextImage();
        }
    }

    return (
        <div
            className="space-y-4"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Specimen image carousel"
        >
            <div className="bg-muted relative overflow-hidden rounded-lg border">
                <div className="relative flex aspect-[16/9] min-h-96 items-center justify-center">
                    <Image
                        src={activeImage.src}
                        alt={activeImage.alt}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 960px, 100vw"
                        className="object-contain"
                    />
                </div>

                {hasMultipleImages && (
                    <div className="absolute inset-y-0 right-0 left-0 flex items-center justify-between p-4">
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="bg-background/90 text-foreground hover:bg-background shadow-md"
                            aria-label="Previous specimen image"
                            onClick={showPreviousImage}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="bg-background/90 text-foreground hover:bg-background shadow-md"
                            aria-label="Next specimen image"
                            onClick={showNextImage}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-semibold">
                        Specimen {activeImage.specimenId}
                    </p>
                    <p className="text-muted-foreground text-sm">
                        {activeImage.sessionLabel} -{' '}
                        {activeImage.collectionDateLabel}
                    </p>
                </div>
                <p className="text-muted-foreground text-sm">
                    {activeIndex + 1} of {images.length}
                </p>
            </div>

            {hasMultipleImages && (
                <div
                    className="flex gap-2 overflow-x-auto pb-1"
                    aria-label="Specimen image thumbnails"
                >
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                'bg-muted relative h-20 w-28 shrink-0 overflow-hidden rounded-md border transition',
                                index === activeIndex
                                    ? 'border-primary ring-primary/30 ring-2'
                                    : 'border-border hover:border-foreground/40',
                            )}
                            aria-label={`Show ${image.alt}`}
                            aria-current={
                                index === activeIndex ? 'true' : undefined
                            }
                        >
                            <Image
                                src={image.src}
                                alt=""
                                fill
                                unoptimized
                                sizes="112px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
