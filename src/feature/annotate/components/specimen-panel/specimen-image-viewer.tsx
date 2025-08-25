import Image from "next/image";
import { cn } from "@/lib/utils";
import { useImageViewer } from "../../hooks/useImageViewer";
import { Button } from "@/components/ui/button";
import { ImageIcon, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface SpecimenImageViewerProps {
  imageUrl?: string;
  className?: string;
}

export function SpecimenImageViewer({
  imageUrl,
  className,
}: SpecimenImageViewerProps) {
  const { zoom, zoomIn, zoomOut, reset, viewerProps, transformStyle } =
    useImageViewer();

  return (
    <div className={cn("w-full", className)}>
      <div
        {...viewerProps}
        className={cn(
          "bg-muted/50 rounded-md overflow-hidden select-none w-full h-[380px]",
          viewerProps.className
        )}
      >
        {imageUrl ? (
          <div className="relative w-full h-full" style={transformStyle}>
            <Image
              src={imageUrl}
              alt="Specimen"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain pointer-events-none"
              draggable={false}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2 mt-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={zoomIn}>
          <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={zoomOut}>
          <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
      </div>
    </div>
  );
}
