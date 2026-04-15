'use client';

import { Card, CardContent } from '@/components/ui/card';

interface OperationsGeographicalSummaryProps {
    district: string;
    startDate: string;
    endDate: string;
}

export default function OperationsGeographicalSummary({
    district,
    startDate,
    endDate,
}: OperationsGeographicalSummaryProps) {
    return (
        <div className="mt-4 space-y-3">
            <h3 className="text-base font-semibold text-teal-600">
                Geographical Summary
            </h3>

            <Card className="border-border/50">
                <CardContent className="flex h-125 items-center justify-center p-0">
                    <p className="text-muted-foreground text-sm">
                        Map will render here.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
