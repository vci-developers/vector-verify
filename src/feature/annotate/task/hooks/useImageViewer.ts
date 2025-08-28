'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

type Point = { x: number; y: number };

type UseImageViewer = {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;

  viewerProps: {
    ref: React.RefObject<HTMLDivElement | null>;
    onPointerDown: (event: React.PointerEvent) => void;
    onPointerMove: (event: React.PointerEvent) => void;
    onPointerUp: (event: React.PointerEvent) => void;
    onPointerCancel: (event: React.PointerEvent) => void;
    className: string;
  };
  transformStyle: React.CSSProperties;
};

export function useImageViewer(maxZoom = 3): UseImageViewer {
  const viewerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });

  const isDraggingRef = useRef(false);
  const dragOriginRef = useRef<Point>({ x: 0, y: 0 });

  const clampPanOffset = useCallback((panOffset: Point, zoom: number) => {
    const viewerElement = viewerRef.current;
    if (!viewerElement || zoom <= 1) return { x: 0, y: 0 };

    const maxPanOffsetX = (viewerElement.clientWidth * (zoom - 1)) / 2;
    const maxPanOffsetY = (viewerElement.clientHeight * (zoom - 1)) / 2;

    return {
      x: Math.max(-maxPanOffsetX, Math.min(maxPanOffsetX, panOffset.x)),
      y: Math.max(-maxPanOffsetY, Math.min(maxPanOffsetY, panOffset.y)),
    };
  }, []);

  const applyZoomChange = useCallback(
    (delta: number) => {
      setZoom((previousZoom) => {
        const nextZoom = Math.min(Math.max(previousZoom + delta, 1), maxZoom);
        setPanOffset((previousOffset) => clampPanOffset(previousOffset, nextZoom));
        return nextZoom;
      });
    },
    [clampPanOffset, maxZoom],
  );

  const resetImageView = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    isDraggingRef.current = false;
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (zoom === 1) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      isDraggingRef.current = true;
      dragOriginRef.current = {
        x: event.clientX - panOffset.x,
        y: event.clientY - panOffset.y,
      };
      event.preventDefault();
    },
    [zoom, panOffset],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      setPanOffset(
        clampPanOffset(
          {
            x: event.clientX - dragOriginRef.current.x,
            y: event.clientY - dragOriginRef.current.y,
          },
          zoom,
        ),
      );
    },
    [clampPanOffset, zoom],
  );

  const endPan = useCallback((event: React.PointerEvent) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    isDraggingRef.current = false;
  }, []);

  const transformStyle = useMemo<React.CSSProperties>(() => {
    return {
      transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
      transition: isDraggingRef.current ? 'none' : 'transform 0.2s ease-out',
      transformOrigin: 'center',
    };
  }, [zoom, panOffset]);

  const getViewerProps = useCallback(() => {
    const cursorClasses =
      zoom > 1 ? (isDraggingRef.current ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default';

    return {
      ref: viewerRef,
      onPointerDown,
      onPointerMove,
      onPointerUp: endPan,
      onPointerCancel: endPan,
      className: cursorClasses,
    };
  }, [onPointerDown, onPointerMove, endPan, zoom]);

  return {
    zoom,
    zoomIn: () => applyZoomChange(0.25),
    zoomOut: () => applyZoomChange(-0.25),
    reset: resetImageView,
    viewerProps: getViewerProps(),
    transformStyle,
  };
}
