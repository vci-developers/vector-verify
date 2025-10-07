'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageModalProps {
  imageUrl: string;
  specimenId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ imageUrl, specimenId, isOpen, onClose }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>Specimen {specimenId} Image</DialogTitle>
        </VisuallyHidden>
        <div className="relative h-[95vh] w-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>
          <div className="flex h-full items-center justify-center p-4">
            <Image
              src={imageUrl}
              alt={`Specimen ${specimenId}`}
              fill
              className="object-contain"
              sizes="95vw"
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}