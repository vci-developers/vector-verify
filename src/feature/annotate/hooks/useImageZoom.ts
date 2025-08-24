import { useState, useRef, RefObject } from "react";

export interface UseImageZoomResult {
  viewerRef: RefObject<HTMLDivElement | null>;
  zoom: number;
  offset: { x: number; y: number };
  isDragging: boolean;
  startDrag: (event: React.MouseEvent) => void;
  doDrag: (event: React.MouseEvent) => void;
  endDrag: () => void;
  adjustZoom: (increment: number) => void;
  resetView: () => void;
}

export function useImageZoom(maxZoom = 3): UseImageZoomResult {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });

  const adjustZoom = (increment: number) => {
    setZoom((prev) => {
      const newZoom = Math.min(Math.max(prev + increment, 1), maxZoom);
      if (newZoom === 1) setOffset({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const startDrag = (event: React.MouseEvent) => {
    if (zoom === 1) return;
    event.preventDefault();
    setIsDragging(true);
    setDragOrigin({ x: event.clientX - offset.x, y: event.clientY - offset.y });
  };

  const doDrag = (event: React.MouseEvent) => {
    if (!isDragging) return;

    // Calculate boundaries based on zoom level
    const boundary = viewerRef.current
      ? (viewerRef.current.clientWidth * (zoom - 1)) / 2
      : 100;

    // Apply constraints to keep image in view
    setOffset({
      x: Math.max(-boundary, Math.min(boundary, event.clientX - dragOrigin.x)),
      y: Math.max(-boundary, Math.min(boundary, event.clientY - dragOrigin.y)),
    });
  };

  const endDrag = () => setIsDragging(false);

  return {
    viewerRef,
    zoom,
    offset,
    isDragging,
    startDrag,
    doDrag,
    endDrag,
    adjustZoom,
    resetView,
  };
}
