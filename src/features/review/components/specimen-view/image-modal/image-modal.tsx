'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent } from '@/ui/dialog';
import { Specimen } from '@/shared/entities/specimen';
import { getSpecimenImageUrl } from '@/shared/entities/specimen/utils';
import { useImageViewer } from '@/features/annotation/components/task-detail/specimen-image-panel/hooks/use-image-viewer';
import { ImageModalHeader } from './image-modal-header';
import { ImageModalContent } from './image-modal-content';
import { ImageModalFooter } from './image-modal-footer';

interface ImageModalProps {
  specimen: Specimen;
  onClose: () => void;
}

export function ImageModal({ specimen, onClose }: ImageModalProps) {
  const imageUrl = getSpecimenImageUrl(specimen);
  const { zoomIn, zoomOut, reset, viewerProps, transformStyle } =
    useImageViewer();

  useEffect(() => {
    reset();
  }, [imageUrl, reset]);

  return (
    <Dialog open={!!specimen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[57vw] h-[57vh] p-0 !grid !grid-rows-[auto_1fr_auto]"
        showCloseButton={false}
        overlayClassName="bg-white/80"
      >
        <ImageModalHeader
          specimenId={specimen.specimenId}
          thumbnailImage={specimen.thumbnailImage}
          onClose={onClose}
        />
        <ImageModalContent
          imageUrl={imageUrl}
          specimenId={specimen.specimenId}
          viewerProps={viewerProps}
          transformStyle={transformStyle}
        />
        <ImageModalFooter
          imageUrl={imageUrl}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={reset}
        />
      </DialogContent>
    </Dialog>
  );
}
