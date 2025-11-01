import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { Specimen } from '@/shared/entities/specimen';

interface SpecimenImageProps {
  specimen: Specimen;
  className?: string;
  onClick?: () => void;
}

function getImageUrl(specimen: Specimen): string | null {
  if (specimen.thumbnailImageId) {
    return `/api/bff/specimens/${specimen.id}/images/${specimen.thumbnailImageId}`;
  }

  const relativePath = specimen.thumbnailImage?.url ?? specimen.thumbnailUrl;
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `/api/bff${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
}

export function SpecimenImage({ specimen, className, onClick }: SpecimenImageProps) {
  const imageUrl = getImageUrl(specimen);

  return (
    <div
      className={className}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
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