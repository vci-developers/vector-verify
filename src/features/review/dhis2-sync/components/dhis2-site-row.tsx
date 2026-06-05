'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { MapPin } from 'lucide-react';
import Dhis2SyncStatusBadge from './dhis2-sync-status-badge';
import type { Dhis2SyncStatus } from '../utils/dhis2-sync-status';

interface Dhis2SiteRowProps {
    siteName: string;
    status: Dhis2SyncStatus;
}

export default function Dhis2SiteRow({ siteName, status }: Dhis2SiteRowProps) {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full">
                        <MapPin className="h-4 w-4" />
                    </div>
                    <span className="text-foreground text-sm font-medium">
                        {siteName}
                    </span>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end">
                    <Dhis2SyncStatusBadge status={status} />
                </div>
            </TableCell>
        </TableRow>
    );
}
