'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { showErrorToast } from '@/shared/ui/show-error-toast';

export function RouteErrorToaster() {
  const searchParams = useSearchParams();
  const router = useRouter();

  function sanitizeMessage(message: string, max = 300): string {
    const noTags = message.replace(/<[^>]*>/g, '').trim();
    return noTags.length > max ? `${noTags.slice(0, max)}...` : noTags;
  }

  useEffect(() => {
    const rawError = searchParams.get('error');
    if (!rawError) return;

    const errorMessage = sanitizeMessage(rawError);
    if (
      !errorMessage ||
      errorMessage === 'undefined' ||
      errorMessage === 'null'
    )
      return;

    const displayMessage = errorMessage;

    const timeoutId = setTimeout(() => {
      showErrorToast(displayMessage);
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      const next = url.search ? url.pathname + url.search : url.pathname;
      router.replace(next);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [router, searchParams]);

  return null;
}
