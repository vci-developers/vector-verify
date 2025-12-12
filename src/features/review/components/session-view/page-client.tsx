'use client';

import { useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/accordion';
import { getMonthDateRange } from '@/features/review/utils/master-table-view';
import { useSessionsInfiniteQuery } from '@/features/review/hooks/use-sessions';
import { CircleUserIcon } from 'lucide-react';
import { SessionDataTable } from './session-data';
import { SessionsAccordionSkeleton } from './loading-skeleton';
import type { Session } from '@/shared/entities/session/model';
import { Button } from '@/ui/button';
import { DEFAULT_PAGE_SIZE } from '@/shared/entities/pagination';

interface SessionsViewPageClientProps {
  district: string;
  monthYear: string;
}

function formatMonthLabel(monthYear: string) {
  const [year, month] = monthYear.split('-');
  return new Date(
    Number.parseInt(year, 10),
    Number.parseInt(month, 10) - 1,
  ).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function SessionsViewPageClient({
  district,
  monthYear,
}: SessionsViewPageClientProps) {
  const decodedDistrict = decodeURIComponent(district);
  const decodedMonthYear = decodeURIComponent(monthYear);

  const dateRange = getMonthDateRange(decodedMonthYear);
  const { startDate, endDate } = dateRange ?? {};

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useSessionsInfiniteQuery(
      {
        district: decodedDistrict,
        startDate,
        endDate,
        limit: DEFAULT_PAGE_SIZE,
      },
      {
        enabled: Boolean(decodedDistrict && startDate && endDate),
      },
    );

  const sessions = data?.pages.flatMap(page => page.items ?? []) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const monthLabel = useMemo(
    () => formatMonthLabel(decodedMonthYear),
    [decodedMonthYear],
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <header className="flex items-end justify-between gap-4 border-b pb-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Sessions View
          </p>
          <h1 className="text-3xl font-semibold">{decodedDistrict}</h1>
          <p className="text-muted-foreground text-sm">{monthLabel}</p>
        </div>
        <div className="text-muted-foreground text-sm">
          <span className="text-2xl font-semibold">
            {sessions.length.toLocaleString()}
          </span>{' '}
          of {total.toLocaleString()} session{total === 1 ? '' : 's'} loaded
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-foreground text-2xl font-semibold">
            Sessions Counts
          </h2>
          <p className="text-muted-foreground text-sm">
            Review sessions for the selected district and month.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading && <SessionsAccordionSkeleton />}

          {!isLoading && sessions.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No sessions found for this selection.
            </p>
          )}

          {sessions.length > 0 && (
            <Accordion
              type="single"
              collapsible
              className="w-full rounded-xl border shadow-sm"
            >
              {sessions.map((session: Session) => {
                const collectionDateObj = session.collectionDate
                  ? new Date(session.collectionDate)
                  : null;
                return (
                  <AccordionItem
                    key={session.sessionId}
                    value={String(session.sessionId)}
                    className="px-4 py-3"
                  >
                    <AccordionTrigger>
                      <div className="grid w-full grid-cols-12 items-center gap-8">
                        <div className="col-span-2 flex items-center">
                          <span className="font-semibold">
                            Collection Date:{' '}
                            {collectionDateObj
                              ? `${String(collectionDateObj.getMonth() + 1).padStart(2, '0')}/${String(collectionDateObj.getDate()).padStart(2, '0')}`
                              : 'No Date'}
                          </span>
                        </div>
                        <div className="col-span-5 flex min-w-0 items-center gap-2">
                          <CircleUserIcon className="text-muted-foreground h-5 w-5 shrink-0" />
                          <span className="truncate font-medium">
                            {session.collectorName || 'Unknown'}
                          </span>
                        </div>
                        <div className="col-span-5 flex min-w-0 items-center">
                          <span className="text-muted-foreground truncate text-sm">
                            Method: {session.collectionMethod || '—'}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4">
                        <div className="mb-4">
                          <div className="bg-card rounded-lg border p-4 shadow-sm">
                            <h3 className="mb-1 text-lg font-semibold">
                              Specimen Condition
                            </h3>
                            <p className="text-muted-foreground mb-4 text-sm">
                              {session.specimenCondition ||
                                'No specimen condition recorded.'}
                            </p>
                            <SessionDataTable
                              district={decodedDistrict}
                              sessionId={String(session.sessionId)}
                              monthYear={monthYear}
                            />
                            <div className="mt-6 border-t pt-4">
                              <label className="text-foreground mb-1 block text-sm font-medium">
                                Notes
                              </label>
                              <textarea
                                className="bg-background text-foreground w-full resize-none rounded border p-2 text-sm"
                                rows={3}
                                value={session.notes || ''}
                                readOnly
                                placeholder="No notes recorded."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
