'use client';

import { Button } from '@/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageModalFooterProps {
  imageUrl: string | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ImageModalFooter({
  imageUrl,
  onZoomIn,
  onZoomOut,
  onReset,
}: ImageModalFooterProps) {
  return (
    <div className="flex justify-center gap-2 border-t px-3 pt-2 pb-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onZoomIn}
        disabled={!imageUrl}
      >
        <ZoomIn className="mr-1 h-4 w-4" /> Zoom In
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onZoomOut}
        disabled={!imageUrl}
      >
        <ZoomOut className="mr-1 h-4 w-4" /> Zoom Out
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        disabled={!imageUrl}
      >
        <RotateCcw className="mr-1 h-4 w-4" /> Reset
      </Button>
    </div>
  );
}
