'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAnnotationTasksQuery } from '@/lib/annotate/client';
import { useUserProfileQuery } from '@/lib/user/client';

export function AnnotatePageClient() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: me } = useUserProfileQuery();
  const { data, isFetching, refetch } = useAnnotationTasksQuery({});

  const myTasks = useMemo(() => {
    return data?.items.filter(task => task.userId === me?.id) ?? [];
  }, [data, me]);

  const total = myTasks.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = myTasks.slice(start, start + pageSize);
  const canPrev = page > 1 && !isFetching;

  const handleRowClick = (taskId: string) => {
    console.log(`Task clicked: ${taskId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6" />
  )
}
