'use client';

import { useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/ui/dialog';
import { Specimen } from '@/shared/entities/specimen';
import { getSpecimenImageUrl } from '@/shared/entities/specimen/utils';
import { useImageViewer } from '@/features/annotation/components/task-detail/specimen-image-panel/hooks/use-image-viewer';
import { useSpecimenImagesQuery } from '@/features/review/hooks/use-specimen-images';
import { ImageModalHeader } from './image-modal-header';
import { ImageModalContent } from './image-modal-content';
import { ImageModalFooter } from './image-modal-footer';

interface ImageModalProps {
  specimen: Specimen;
  onClose: () => void;
}

export function ImageModal({ specimen, onClose }: ImageModalProps) {
  const { data: imagesData, isLoading: isLoadingImages } =
    useSpecimenImagesQuery(specimen.id);

  const imageUrl = useMemo(() => {
    if (imagesData?.images && imagesData.images.length > 0) {
      const firstImage = imagesData.images[0];
      if (firstImage.url.startsWith('http')) return firstImage.url;
      return `/api/bff${firstImage.url.startsWith('/') ? firstImage.url : `/${firstImage.url}`}`;
    }
    return getSpecimenImageUrl(specimen);
  }, [imagesData, specimen]);

  const { zoomIn, zoomOut, reset, viewerProps, transformStyle } =
    useImageViewer();

  useEffect(() => {
    reset();
  }, [imageUrl, reset]);

  return (
    <Dialog open={!!specimen} onOpenChange={onClose}>
      <DialogContent
        className="!grid h-[57vh] max-w-[57vw] !grid-rows-[auto_1fr_auto] p-0"
        showCloseButton={false}
        overlayClassName="bg-white/80"
      >
        <ImageModalHeader
          specimenId={specimen.specimenId}
          thumbnailImage={specimen.thumbnailImage}
          onClose={onClose}
        />
        <ImageModalContent
          imageUrl={isLoadingImages ? null : imageUrl}
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
