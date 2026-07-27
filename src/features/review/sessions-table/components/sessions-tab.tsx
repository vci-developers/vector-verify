'use client';

import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import type { Site } from '@/api/site/validation/site-schema';
import type { SessionState } from '@/api/session/validation/session-schema';
import type { LocationQueryParam } from '@/lib/location/location-query';
import { buildSiteFilter } from '@/lib/location/location-query';
import { Input } from '@/components/ui/input';
import SessionsTable from '@/features/review/sessions-table/components/sessions-table';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface SessionsTabProps {
    programId: number;
    sites: Site[];
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    selectedReviewStates: SessionState[];
    locationQueryParam: LocationQueryParam | undefined;
    startMonth: Date;
    endMonth: Date;
}

export default function SessionsTab({
    programId,
    sites,
    collectionCycles,
    selectedCycleIds,
    selectedReviewStates,
    locationQueryParam,
    startMonth,
    endMonth,
}: SessionsTabProps) {
    const t = useTranslations('ReviewSessionsTable');
    const [search, setSearch] = useState('');

    return (
        <div className="flex flex-col space-y-4">
            <Input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full"
            />

            <SessionsTable
                programId={programId}
                sites={sites}
                collectionCycles={collectionCycles}
                selectedCycleIds={selectedCycleIds}
                selectedReviewStates={selectedReviewStates}
                selectedLocation={
                    locationQueryParam
                        ? buildSiteFilter(locationQueryParam)
                        : null
                }
                startMonth={startMonth}
                endMonth={endMonth}
                search={search}
            />
        </div>
    );
}
