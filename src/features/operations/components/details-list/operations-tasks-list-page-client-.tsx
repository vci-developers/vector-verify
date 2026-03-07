'use client';

import { useState } from 'react';
import type { Site } from '@/api/site/validation/site-schema';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquareIcon } from 'lucide-react';
import OperationsTasksDetailsHeader, { type ViewValue } from './operations-tasks-details-header';
import { Separator } from '@/components/ui/separator';
import OperationsDetailsList from './operations-details-list';

interface ReviewTasksListPageClientProps {
    accessibleSites: Site[];
}


export default function ReviewTasksListPageClient({
    accessibleSites,
}: ReviewTasksListPageClientProps) {
    const [activeView, setActiveView] = useState<ViewValue>("village");
    
    return (
        <PageShell
            title="Review Tasks"
            description="Review and annotate"
            icon={CheckSquareIcon}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <OperationsTasksDetailsHeader 
                        accessibleSites={accessibleSites}
                        activeView={activeView}
                        onViewChange={setActiveView}
                    />

                    <Separator />

                    <OperationsDetailsList 
                        accessibleSites={accessibleSites}
                        activeView={activeView}
                    />

                </CardContent>
            </Card>
        </PageShell>
    )
}