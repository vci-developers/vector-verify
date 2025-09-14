import {
  MutationCache,
  QueryCache,
  QueryClient,
  type QueryClientConfig,
} from '@tanstack/react-query';
import { showErrorToast } from '@/lib/shared/ui/show-error-toast';

export function createQueryClient(config?: QueryClientConfig): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      ...(config?.defaultOptions ?? {}),
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        const meta = (query as unknown as { meta?: Record<string, unknown> })
          ?.meta;
        if (meta && (meta as Record<string, unknown>).suppressErrorToast) return;
        showErrorToast(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: error => showErrorToast(error),
    }),
  });
}

