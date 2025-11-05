'use client';

import Image from 'next/image';
import { ImageOff } from 'lucide-react';

interface ImageModalContentProps {
  imageUrl: string | null;
  specimenId: string;
  viewerProps: {
    ref: React.RefObject<HTMLDivElement | null>;
    onPointerDown: (event: React.PointerEvent) => void;
    onPointerMove: (event: React.PointerEvent) => void;
    onPointerUp: (event: React.PointerEvent) => void;
    onPointerCancel: (event: React.PointerEvent) => void;
    className: string;
  };
  transformStyle: React.CSSProperties;
}

export function ImageModalContent({
  imageUrl,
  specimenId,
  viewerProps,
  transformStyle,
}: ImageModalContentProps) {
  return (
    <div className="relative overflow-hidden min-h-0">
      <div
        {...viewerProps}
        className="h-full w-full overflow-hidden bg-white"
      >
        {imageUrl ? (
          <div className="relative h-full w-full" style={transformStyle}>
            <Image
              src={imageUrl}
              alt={`Specimen ${specimenId}`}
              fill
              className="object-contain"
              sizes="95vw"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <ImageOff className="h-16 w-16" />
              <div className="text-center">
                <p className="text-lg font-medium">No Image Available</p>
                <p className="text-sm">
                  This specimen does not have an associated image.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
