'use client';

import { showErrorToast } from '@/lib/shared/ui/show-error-toast';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface ProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Allow per-query suppression via meta
      // tanstack exposes meta on the query; typing for meta can be lax
      const meta = (query as unknown as { meta?: Record<string, unknown> })
        ?.meta;
      if (meta && meta.suppressErrorToast) return;
      showErrorToast(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: error => showErrorToast(error),
  }),
});

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
