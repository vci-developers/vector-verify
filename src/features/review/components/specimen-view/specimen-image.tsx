import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { Specimen } from '@/shared/entities/specimen';
import { getImageUrl } from '@/features/review/utils/get-image';

interface SpecimenImageProps {
  specimen: Specimen;
  className?: string;
  onClick?: () => void;
}

export function SpecimenImage({ specimen, className, onClick }: SpecimenImageProps) {
  const imageUrl = getImageUrl(specimen);
  const hasValidImage = imageUrl !== null;

  return (
    <div
      className={className}
      onClick={hasValidImage ? onClick : undefined}
      style={hasValidImage && onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className="px-2 pt-2 text-xs text-muted-foreground">
        {specimen.specimenId}
      </div>
      <div className="relative aspect-[4/3] w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Specimen ${specimen.specimenId}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageOff className="h-8 w-8" />
              <span className="text-xs">No image available</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}