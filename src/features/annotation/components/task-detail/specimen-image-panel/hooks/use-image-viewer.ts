'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Point = { x: number; y: number };

interface UseImageViewer {
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
    onWheel: (event: React.WheelEvent) => void;
    style?: React.CSSProperties;
    className: string;
  };
  transformStyle: React.CSSProperties;
}

const ZOOM_STEP = 0.25;
const MIN_ZOOM = 1;
const ZOOM_SENSITIVITY = {
  PIXEL: 0.01,
  LINE: 0.15,
  PAGE: 0.75,
};
const ZOOM_THRESHOLD = 0.001;
const TRANSITION_DURATION = '0.2s';

function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateCenter(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calculateZoomDelta(event: React.WheelEvent): number {
  const sensitivity =
    event.deltaMode === 0
      ? ZOOM_SENSITIVITY.PIXEL
      : event.deltaMode === 1
        ? ZOOM_SENSITIVITY.LINE
        : ZOOM_SENSITIVITY.PAGE;
  return -event.deltaY * sensitivity;
}

function getViewerCenter(element: HTMLElement): Point {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function useImageViewer(maxZoom: number = 3): UseImageViewer {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });

  const zoomRef = useRef(MIN_ZOOM);
  const panOffsetRef = useRef<Point>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragOriginRef = useRef<Point>({ x: 0, y: 0 });

  const activePointersRef = useRef<Map<number, Point>>(new Map());
  const pinchDistanceRef = useRef<number | null>(null);
  const pinchCenterRef = useRef<Point | null>(null);
  const pinchZoomRef = useRef<number | null>(null);
  const pinchPanOffsetRef = useRef<Point | null>(null);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    const viewerElement = viewerRef.current;
    if (!viewerElement) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
      }
    };

    viewerElement.addEventListener('wheel', handleWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      viewerElement.removeEventListener('wheel', handleWheel, {
        capture: true,
      } as EventListenerOptions);
    };
  }, []);

  const clampPanOffset = useCallback(
    (offset: Point, currentZoom: number): Point => {
      const viewerElement = viewerRef.current;
      if (!viewerElement || currentZoom <= MIN_ZOOM) {
        return { x: 0, y: 0 };
      }

      const maxOffsetX = (viewerElement.clientWidth * (currentZoom - 1)) / 2;
      const maxOffsetY = (viewerElement.clientHeight * (currentZoom - 1)) / 2;

      return {
        x: clamp(offset.x, -maxOffsetX, maxOffsetX),
        y: clamp(offset.y, -maxOffsetY, maxOffsetY),
      };
    },
    [],
  );

  const applyZoomChange = useCallback(
    (delta: number) => {
      setZoom(previousZoom => {
        const nextZoom = clamp(previousZoom + delta, MIN_ZOOM, maxZoom);
        setPanOffset(previousOffset =>
          clampPanOffset(previousOffset, nextZoom),
        );
        return nextZoom;
      });
    },
    [clampPanOffset, maxZoom],
  );

  const resetImageView = useCallback(() => {
    setZoom(MIN_ZOOM);
    setPanOffset({ x: 0, y: 0 });
    isDraggingRef.current = false;
    activePointersRef.current.clear();
    pinchDistanceRef.current = null;
    pinchCenterRef.current = null;
    pinchZoomRef.current = null;
    pinchPanOffsetRef.current = null;
  }, []);

  const initializePinchZoom = useCallback(
    (point1: Point, point2: Point) => {
      pinchDistanceRef.current = calculateDistance(point1, point2);
      pinchCenterRef.current = calculateCenter(point1, point2);
      pinchZoomRef.current = zoom;
      pinchPanOffsetRef.current = { ...panOffset };
      isDraggingRef.current = false;
    },
    [zoom, panOffset],
  );

  const initializeDrag = useCallback(
    (point: Point) => {
      isDraggingRef.current = true;
      dragOriginRef.current = {
        x: point.x - panOffset.x,
        y: point.y - panOffset.y,
      };
    },
    [panOffset],
  );

  const updatePinchZoom = useCallback(
    (point1: Point, point2: Point) => {
      if (
        pinchDistanceRef.current === null ||
        pinchCenterRef.current === null ||
        pinchZoomRef.current === null ||
        pinchPanOffsetRef.current === null
      ) {
        return;
      }

      const viewerElement = viewerRef.current;
      if (!viewerElement) return;

      const currentDistance = calculateDistance(point1, point2);
      const distanceRatio = currentDistance / pinchDistanceRef.current;
      const newZoom = clamp(
        pinchZoomRef.current * distanceRatio,
        MIN_ZOOM,
        maxZoom,
      );

      const viewerCenter = getViewerCenter(viewerElement);
      const offsetFromViewerCenter = {
        x: pinchCenterRef.current.x - viewerCenter.x,
        y: pinchCenterRef.current.y - viewerCenter.y,
      };
      const zoomRatio = newZoom / pinchZoomRef.current;

      const newPanOffset = {
        x:
          pinchPanOffsetRef.current.x +
          offsetFromViewerCenter.x * (1 - zoomRatio),
        y:
          pinchPanOffsetRef.current.y +
          offsetFromViewerCenter.y * (1 - zoomRatio),
      };

      setZoom(newZoom);
      setPanOffset(clampPanOffset(newPanOffset, newZoom));
    },
    [clampPanOffset, maxZoom],
  );

  const updateDrag = useCallback(
    (point: Point) => {
      setPanOffset(
        clampPanOffset(
          {
            x: point.x - dragOriginRef.current.x,
            y: point.y - dragOriginRef.current.y,
          },
          zoom,
        ),
      );
    },
    [clampPanOffset, zoom],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.currentTarget.setPointerCapture(event.pointerId);

      const point: Point = { x: event.clientX, y: event.clientY };
      activePointersRef.current.set(event.pointerId, point);

      const activePointers = Array.from(activePointersRef.current.values());

      if (activePointers.length === 2) {
        const [p1, p2] = activePointers;
        initializePinchZoom(p1, p2);
      } else if (activePointers.length === 1 && zoom > MIN_ZOOM) {
        initializeDrag(point);
      }

      event.preventDefault();
    },
    [zoom, initializePinchZoom, initializeDrag],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const point: Point = { x: event.clientX, y: event.clientY };
      activePointersRef.current.set(event.pointerId, point);

      const activePointers = Array.from(activePointersRef.current.values());

      if (activePointers.length >= 2) {
        event.preventDefault();
      }

      if (activePointers.length === 2) {
        const [p1, p2] = activePointers;
        updatePinchZoom(p1, p2);
      } else if (isDraggingRef.current && activePointers.length === 1) {
        updateDrag(point);
      }
    },
    [updatePinchZoom, updateDrag],
  );

  const endPan = useCallback(
    (event: React.PointerEvent) => {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      activePointersRef.current.delete(event.pointerId);

      const activePointers = Array.from(activePointersRef.current.values());

      if (activePointers.length !== 2) {
        pinchDistanceRef.current = null;
        pinchCenterRef.current = null;
        pinchZoomRef.current = null;
        pinchPanOffsetRef.current = null;
      }

      if (activePointers.length === 1 && zoom > MIN_ZOOM) {
        const remainingPointer = activePointers[0];
        isDraggingRef.current = true;
        dragOriginRef.current = {
          x: remainingPointer.x - panOffset.x,
          y: remainingPointer.y - panOffset.y,
        };
      } else {
        isDraggingRef.current = false;
      }
    },
    [zoom, panOffset],
  );

  const onWheel = useCallback(
    (event: React.WheelEvent) => {
      const isPinchGesture = event.ctrlKey || event.metaKey;

      if (!isPinchGesture) return;

      event.preventDefault();

      const viewerElement = viewerRef.current;
      if (!viewerElement) return;

      const zoomDelta = calculateZoomDelta(event);
      const currentZoom = zoomRef.current;
      const currentPanOffset = panOffsetRef.current;
      const newZoom = clamp(currentZoom + zoomDelta, MIN_ZOOM, maxZoom);

      if (Math.abs(newZoom - currentZoom) < ZOOM_THRESHOLD) return;

      const viewerCenter = getViewerCenter(viewerElement);
      const offsetFromViewerCenter = {
        x: event.clientX - viewerCenter.x,
        y: event.clientY - viewerCenter.y,
      };
      const zoomRatio = newZoom / currentZoom;

      const newPanOffset = {
        x: currentPanOffset.x + offsetFromViewerCenter.x * (1 - zoomRatio),
        y: currentPanOffset.y + offsetFromViewerCenter.y * (1 - zoomRatio),
      };

      setZoom(newZoom);
      setPanOffset(clampPanOffset(newPanOffset, newZoom));
    },
    [maxZoom, clampPanOffset],
  );

  const transformStyle = useMemo<React.CSSProperties>(() => {
    const isPinching = pinchDistanceRef.current !== null;
    const shouldDisableTransition = isDraggingRef.current || isPinching;

    return {
      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
      transition: shouldDisableTransition
        ? 'none'
        : `transform ${TRANSITION_DURATION} ease-out`,
      transformOrigin: 'center',
    };
  }, [zoom, panOffset]);

  const viewerProps = useMemo(() => {
    const getCursorClass = () => {
      if (zoom <= MIN_ZOOM) return 'cursor-default';
      return isDraggingRef.current ? 'cursor-grabbing' : 'cursor-grab';
    };

    return {
      ref: viewerRef,
      onPointerDown,
      onPointerMove,
      onPointerUp: endPan,
      onPointerCancel: endPan,
      onWheel,
      style: {
        touchAction: 'none',
      } as React.CSSProperties,
      className: getCursorClass(),
    } as const;
  }, [onPointerDown, onPointerMove, endPan, onWheel, zoom]);

  return {
    zoom,
    zoomIn: () => applyZoomChange(ZOOM_STEP),
    zoomOut: () => applyZoomChange(-ZOOM_STEP),
    reset: resetImageView,
    viewerProps,
    transformStyle,
  };
}
