'use client';

import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import ReviewHouseList from './review-house-list';

interface ReviewHouseListPageClientProps {
    district: string;
}

export default function ReviewHouseListPageClient({
    district,
}: ReviewHouseListPageClientProps) {
    return (
        <PageShell
            title={`Review — ${district}`}
            description="Review session data for each house in this district"
            icon={ClipboardList}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6">
                    <ReviewHouseList district={district} />
                </CardContent>
            </Card>
        </PageShell>
    );
}
