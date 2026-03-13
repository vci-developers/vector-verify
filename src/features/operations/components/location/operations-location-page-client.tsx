'use client';

import PageShell from '@/components/layout/page-shell';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Activity } from 'lucide-react';
import OperationsMetricsTab from './metrics/operations-metrics-tab';

interface OperationsLocationPageClientProps {
    location: string;
}

export default function OperationsLocationPageClient({
    location,
}: OperationsLocationPageClientProps) {
    return (
        <PageShell title={`View - ${location}`} icon={Activity}>
            <Tabs defaultValue="metrics">
                <TabsList variant="line">
                    <TabsTrigger value="houses">Houses</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="ai-performance">
                        AI Performance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="houses">
                    <p className="text-muted-foreground text-sm">
                        Coming soon.
                    </p>
                </TabsContent>

                <TabsContent value="metrics">
                    <OperationsMetricsTab />
                </TabsContent>

                <TabsContent value="ai-performance">
                    <p className="text-muted-foreground text-sm">
                        Coming soon.
                    </p>
                </TabsContent>
            </Tabs>
        </PageShell>
    );
}
