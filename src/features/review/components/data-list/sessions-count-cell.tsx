import { useMemo } from 'react';

import { useSessionsQuery } from '@/features/review/hooks/use-sessions';
import { getMonthDateRange } from '@/features/review/utils/master-table-view';

interface SessionsCountCellProps {
  district: string;
  monthString: string;
}

const MINIMUM_LIMIT = 1;

export function SessionsCountCell({
  district,
  monthString,
}: SessionsCountCellProps) {
  const dateRange = useMemo(
    () => getMonthDateRange(monthString),
    [monthString],
  );

  const filters = useMemo(
    () => ({
      district,
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate,
      limit: MINIMUM_LIMIT,
      offset: 0,
    }),
    [district, dateRange?.endDate, dateRange?.startDate],
  );

  const { data, isLoading, isFetching } = useSessionsQuery(filters);
  const totalSessions = data?.total;

  let content = '—';
  if (isLoading || isFetching) {
    content = 'Loading...';
  } else if (totalSessions !== undefined) {
    content = totalSessions.toLocaleString();
  }

  return (
    <div className="text-center">
      <div className="text-foreground font-semibold">{content}</div>
    </div>
  );
}

