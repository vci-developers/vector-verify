import { cn } from '@/lib/utils';
import { useImageViewer } from './hooks/use-image-viewer';
import { ImageIcon, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface SpecimenImageViewerProps {
  imageUrl: string;
}

export function SpecimenImageViewer({ imageUrl }: SpecimenImageViewerProps) {
  const { zoom, zoomIn, zoomOut, reset, viewerProps, transformStyle } =
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
              priority
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="text-muted-foreground/40 h-12 w-12" />
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-center gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={zoomIn}>
          <ZoomIn className="mr-1 h-4 w-4" /> Zoom In
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={zoomOut}
        >
          <ZoomOut className="mr-1 h-4 w-4" /> Zoom Out
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={reset}>
          <RotateCcw className="mr-1 h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
}
