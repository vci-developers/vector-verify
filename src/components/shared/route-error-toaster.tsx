'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { showErrorToast } from '@/lib/shared/ui/toast';

export function RouteErrorToaster() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (!errorParam) return;
    const message = errorParam.trim();
    if (!message) return;

    const statusParam = searchParams.get('status');
    const status = statusParam ? Number(statusParam) : undefined;
    const friendly =
      status === 401
        ? 'Your session has expired. Please sign in again.'
        : message;

    const id = setTimeout(() => {
      showErrorToast(friendly);
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('status');
      const next = url.search ? url.pathname + url.search : url.pathname;
      router.replace(next);
    }, 0);

    return () => clearTimeout(id);
  }, [router, searchParams]);

  return null;
}
