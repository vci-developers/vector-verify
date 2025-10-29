'use client';

import React, { useMemo } from 'react';
import { useSessionsQuery } from '@/features/review/hooks/use-sessions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/accordion';
import { getMonthDateRange } from '@/features/review/utils/master-table-view';
import { CircleUserIcon } from 'lucide-react';
import { SessionDataTable } from './session-data';

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

  const { 
    data: sessions,
    isLoading,
   } = useSessionsQuery({
    district: decodedDistrict,
    startDate,
    endDate,
  });

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
          <p className="text-muted-foreground text-sm">
            {monthLabel}
          </p>
        </div>
        {sessions && (
          <div className="text-muted-foreground text-sm">
            <span className="text-2xl font-semibold">
              {sessions.length.toLocaleString()}
            </span>{' '}
            session{sessions.length === 1 ? '' : 's'} in view
          </div>
        )}
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
          {isLoading && (
            <p className="text-muted-foreground text-sm">Loading sessions…</p>
          )}

          {!isLoading && (!sessions || sessions.length === 0) && (
            <p className="text-muted-foreground text-sm">
              No sessions found for this selection.
            </p>
          )}

          {sessions && sessions.length > 0 && (
            <Accordion type="single" collapsible className="w-full border rounded-xl shadow-sm">
              {sessions.map(session => {
                const collectionDateObj = session.collectionDate ? new Date(session.collectionDate) : null;
                return (
                  <AccordionItem
                    key={session.sessionId}
                    value={String(session.sessionId)}
                    className="px-4 py-3"
                  >
                    <AccordionTrigger>
                      <div className="grid grid-cols-12 items-center w-full gap-2">
                        <div className="col-span-2 flex items-center">
                          <span className="font-semibold">
                            {collectionDateObj
                              ? `${String(collectionDateObj.getMonth() + 1).padStart(2, '0')}/${String(collectionDateObj.getDate()).padStart(2, '0')}`
                              : 'No Date'}
                          </span>
                        </div>
                        <div className="col-span-5 flex items-center gap-2 min-w-0">
                          <CircleUserIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                          <span className="truncate font-medium">
                            {session.collectorTitle || 'Unknown'}
                          </span>
                        </div>
                        <div className="col-span-5 flex items-center min-w-0">
                          <span className="text-sm text-muted-foreground truncate">
                            Method: {session.collectionMethod || '—'}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4">
                        <div className="mb-4">
                          <div className="rounded-lg border bg-card p-4 shadow-sm">
                            <h3 className="text-lg font-semibold mb-1">Specimen Condition</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                              {session.specimenCondition || 'No specimen condition recorded.'}
                            </p>
                            <SessionDataTable
                              district={decodedDistrict}
                              sessionId={String(session.sessionId)}
                              monthYear={monthYear}
                            />
                            <div className="border-t mt-6 pt-4">
                              <label className="block text-sm font-medium mb-1 text-foreground">
                                Notes
                              </label>
                              <textarea
                                className="w-full rounded border bg-background p-2 text-sm text-foreground resize-none"
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
        </div>
      </section>
    </div>
  );
}