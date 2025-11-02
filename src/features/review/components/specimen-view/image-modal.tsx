'use client';

import { Dialog, DialogContent, DialogTitle } from '@/ui/dialog';
import Image from 'next/image';
import { X, ImageOff } from 'lucide-react';
import { Button } from '@/ui/button';
import { Specimen } from '@/shared/entities/specimen';

interface ImageModalProps {
  specimen: Specimen;
  onClose: () => void;
}

function getImageUrl(specimen: Specimen): string | null {
  if (specimen.thumbnailImageId) {
    return `/api/bff/specimens/${specimen.id}/images/${specimen.thumbnailImageId}`;
  }

  const relativePath = specimen.thumbnailImage?.url ?? specimen.thumbnailUrl;
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `/api/bff${
    relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  }`;
}

export function ImageModal({ specimen, onClose }: ImageModalProps) {
  const imageUrl = getImageUrl(specimen);

  return (
    <Dialog open={!!specimen} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[95vh] max-w-[95vw] p-0"
        showCloseButton={false}
      >
        <DialogTitle className="px-4 py-3 text-lg font-semibold">
          Specimen {specimen.specimenId}
        </DialogTitle>
        <div className="relative h-[95vh] w-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>
          <div className="flex h-full items-center justify-center p-4">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`Specimen ${specimen.specimenId}`}
                fill
                className="object-contain"
                sizes="95vw"
                unoptimized
              />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-4">
                <ImageOff className="h-16 w-16" />
                <div className="text-center">
                  <p className="text-lg font-medium">No Image Available</p>
                  <p className="text-sm">
                    This specimen does not have an associated image.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
