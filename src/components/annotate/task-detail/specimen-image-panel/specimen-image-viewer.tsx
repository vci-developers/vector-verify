'use client';

import { cn } from '@/lib/utils';
import { useImageViewer } from './hooks/use-image-viewer';
import { ImageOff, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface SpecimenImageViewerProps {
  imageUrl?: string | null;
}

export function SpecimenImageViewer({ imageUrl }: SpecimenImageViewerProps) {
  const { zoomIn, zoomOut, reset, viewerProps, transformStyle } =
    useImageViewer();

  return (
    <div className="w-full">
      <div
        {...viewerProps}
        className={cn(
          'bg-muted/50 h-[380px] w-full overflow-hidden rounded-md select-none',
          viewerProps.className,
        )}
      >
        {imageUrl ? (
          <div className="relative h-full w-full" style={transformStyle}>
            <Image
              src={imageUrl}
              alt="Specimen Image"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground border-border/60 bg-muted/30 flex h-[55vh] min-h-[320px] w-full flex-col items-center justify-center gap-2 rounded-lg border text-sm">
              <ImageOff className="h-6 w-6" />
              No image available.
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={zoomIn}
          disabled={!imageUrl}
        >
          <ZoomIn className="mr-1 h-4 w-4" /> Zoom In
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={zoomOut}
          disabled={!imageUrl}
        >
          <ZoomOut className="mr-1 h-4 w-4" /> Zoom Out
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={reset}
          disabled={!imageUrl}
        >
          <RotateCcw className="mr-1 h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
}
