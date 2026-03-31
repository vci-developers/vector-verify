import PageShell from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Activity, CalendarDays } from 'lucide-react';

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
            <Card className="overflow-hidden p-5">
                <p className="text-muted-foreground text-sm">
                    House detail content will appear here.
                </p>
            </Card>
        </PageShell>
    );
}
