'use client';

import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export default function ReviewPageClient() {
    return (
        <PageShell
            title="Review"
            description="Review submitted session data by location"
            icon={ClipboardList}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6" />
            </Card>
        </PageShell>
    );
}
