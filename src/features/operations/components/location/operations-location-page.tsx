import type { Site } from '@/api/site/validation/site-schema';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Microscope } from 'lucide-react';
import OperationsHousesTab from './operations-houses-tab';
import OperationsMetricsTab from './metrics/operations-metrics-tab';

interface OperationsLocationPageProps {
    district: string;
    sites: Site[];
    siteIdToSessionCounts: Map<number, number>;
}

function OperationsLocationTabEmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground text-sm">{message}</p>
        </div>
    );
}

export default function OperationsLocationPage({
    district,
    sites,
    siteIdToSessionCounts,
}: OperationsLocationPageProps) {
    return (
        <PageShell
            title={`Operations - ${district}`}
            description="Monitor field operations for this district"
            icon={Microscope}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6">
                    <Tabs defaultValue="houses" className="space-y-4">
                        <TabsList
                            variant="line"
                            className="border-border w-full justify-start border-b"
                        >
                            <TabsTrigger value="houses" className="px-4 py-3">
                                Houses
                            </TabsTrigger>
                            <TabsTrigger value="metrics" className="px-4 py-3">
                                Metrics
                            </TabsTrigger>
                            <TabsTrigger
                                value="ai-performance"
                                className="px-4 py-3"
                            >
                                AI Performance
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="houses" className="mt-0">
                            {sites.length > 0 ? (
                                <OperationsHousesTab
                                    sites={sites}
                                    siteIdToSessionCounts={
                                        siteIdToSessionCounts
                                    }
                                />
                            ) : (
                                <OperationsLocationTabEmptyState message="No accessible houses were found for this district." />
                            )}
                        </TabsContent>

                        <TabsContent value="metrics" className="mt-0">
                            <OperationsMetricsTab />
                        </TabsContent>

                        <TabsContent value="ai-performance" className="mt-0">
                            <OperationsLocationTabEmptyState message="AI Performance is coming soon." />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </PageShell>
    );
}
