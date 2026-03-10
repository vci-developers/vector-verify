'use client';

import { useDistrictList } from '@/features/operations/hooks/use-district-list';
import PageShell from '@/components/layout/page-shell';
import { Activity } from 'lucide-react';
import OperationsDistrictList from './operations-district-list';

export default function OperationsDistrictListPageClient() {
    const { districts, isPending, isError } = useDistrictList();

    return (
        <PageShell
            title="Operations"
            description="District-level entomological metrics and session data"
            icon={Activity}
        >
            {isPending ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
            ) : isError ? (
                <p className="text-destructive text-sm">
                    Failed to load districts.
                </p>
            ) : (
                <OperationsDistrictList districts={districts} />
            )}
        </PageShell>
    );
}
