'use client';

import { DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { X } from 'lucide-react';
import type { SpecimenImage } from '@/shared/entities/specimen-image/model';

interface ImageModalHeaderProps {
  specimenId: string;
  thumbnailImage: SpecimenImage | null | undefined;
  onClose: () => void;
}

export function ImageModalHeader({
  specimenId,
  thumbnailImage,
  onClose,
}: ImageModalHeaderProps) {
  const species = thumbnailImage?.species;
  const sex = thumbnailImage?.sex;
  const abdomenStatus = thumbnailImage?.abdomenStatus;

  return (
    <div className="px-4 pt-3 pb-2 border-b">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-lg font-semibold">
          {specimenId}
        </DialogTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-foreground hover:bg-muted"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      {(species || sex || abdomenStatus) && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
          {species && <div>Species: {species}</div>}
          {sex && <div>Sex: {sex}</div>}
          {abdomenStatus && <div>Abdomen Status: {abdomenStatus}</div>}
        </div>
      )}
    </div>
  );
}
