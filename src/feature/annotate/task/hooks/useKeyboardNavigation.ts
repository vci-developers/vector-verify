'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type NavigationDirection = 'previous' | 'next' | null;

type UseKeyboardNavigation = {
  activeNavigationDirection: NavigationDirection;
};

export function useKeyboardNavigation(
  canNavigatePrevious: boolean,
  canNavigateNext: boolean,
  onNavigatePrevious: () => void,
  onNavigateNext: () => void,
): UseKeyboardNavigation {
  const [activeNavigationDirection, setActiveNavigationDirection] =
    useState<NavigationDirection>(null);

  const canNavigatePreviousRef = useRef(canNavigatePrevious);
  const canNavigateNextRef = useRef(canNavigateNext);
  const onNavigatePreviousRef = useRef(onNavigatePrevious);
  const onNavigateNextRef = useRef(onNavigateNext);

  useEffect(() => {
    canNavigatePreviousRef.current = canNavigatePrevious;
  }, [canNavigatePrevious]);
  useEffect(() => {
    canNavigateNextRef.current = canNavigateNext;
  }, [canNavigateNext]);
  useEffect(() => {
    onNavigatePreviousRef.current = onNavigatePrevious;
  }, [onNavigatePrevious]);
  useEffect(() => {
    onNavigateNextRef.current = onNavigateNext;
  }, [onNavigateNext]);

  const isEventFromEditableTarget = (event: KeyboardEvent): boolean => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return false;

    const tag = target.tagName;
    return (
      target.isContentEditable === true || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
    );
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEventFromEditableTarget(event)) {
      if (event.key === 'ArrowLeft' && canNavigatePreviousRef.current) {
        event.preventDefault();
        setActiveNavigationDirection('previous');
        onNavigatePreviousRef.current();
      } else if (event.key === 'ArrowRight' && canNavigateNextRef.current) {
        event.preventDefault();
        setActiveNavigationDirection('next');
        onNavigateNextRef.current();
      }
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      setActiveNavigationDirection(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { activeNavigationDirection };
}
