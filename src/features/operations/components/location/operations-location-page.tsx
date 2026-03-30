import PageShell from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, CalendarDays } from 'lucide-react';
import OperationsAiPerformanceTab from './ai-performance/operations-ai-performance-tab';

interface OperationsLocationPageProps {
    district: string;
}

const DATE_RANGE_LABEL = '2026-01-01 to 2026-02-24';

export default function OperationsLocationPage({
    district,
}: OperationsLocationPageProps) {
    return (
        <PageShell
            title={`View - ${district}`}
            description={DATE_RANGE_LABEL}
            icon={Activity}
            headerAction={
                <div className="bg-card text-muted-foreground flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-sm">
                    <CalendarDays className="h-4 w-4" />
                    <span>{DATE_RANGE_LABEL}</span>
                </div>
            }
        >
            <Card className="overflow-hidden py-0">
                <Tabs defaultValue="ai-performance">
                    <TabsList
                        variant="line"
                        className="h-auto gap-5 border-b px-5 py-0"
                    >
                        <TabsTrigger
                            value="houses"
                            className="rounded-none px-1 py-4 after:-bottom-px"
                        >
                            Houses
                        </TabsTrigger>
                        <TabsTrigger
                            value="metrics"
                            className="rounded-none px-1 py-4 after:-bottom-px"
                        >
                            Metrics
                        </TabsTrigger>
                        <TabsTrigger
                            value="ai-performance"
                            className="rounded-none px-1 py-4 after:-bottom-px"
                        >
                            AI Performance
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="houses" className="p-5">
                        <p className="text-muted-foreground text-sm">
                            House detail content will appear here.
                        </p>
                    </TabsContent>

                    <TabsContent value="metrics" className="p-5">
                        <p className="text-muted-foreground text-sm">
                            Metrics content will appear here.
                        </p>
                    </TabsContent>

                    <TabsContent value="ai-performance" className="p-5">
                        <OperationsAiPerformanceTab />
                    </TabsContent>
                </Tabs>
            </Card>
        </PageShell>
    );
}
