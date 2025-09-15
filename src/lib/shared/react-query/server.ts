import {
  QueryClient,
  dehydrate,
  type DehydratedState,
  type QueryClientConfig,
  type QueryKey,
} from '@tanstack/react-query';

type Seed = { key: QueryKey; data: unknown };

export function dehydrateWithSeed(
  seeds: Seed[],
  config?: QueryClientConfig,
): DehydratedState {
  const client = new QueryClient(config);
  for (const { key, data } of seeds) client.setQueryData(key, data);
  return dehydrate(client);
}

export async function dehydrateWithPrefetch(
  queries: { key: QueryKey; queryFn: () => Promise<unknown> }[],
  config?: QueryClientConfig,
): Promise<DehydratedState> {
  const client = new QueryClient(config);
  await Promise.all(
    queries.map(({ key, queryFn }) =>
      client.prefetchQuery({ queryKey: key, queryFn }),
    ),
  );
  return dehydrate(client);
}
