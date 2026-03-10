'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin } from 'lucide-react';
import Link from 'next/link';

interface OperationsDistrictCardProps {
    district: string;
    siteCount: number;
}

export default function OperationsDistrictCard({
    district,
    siteCount,
}: OperationsDistrictCardProps) {
    return (
        <Link href={`/operations/${encodeURIComponent(district)}`}>
            <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:border-border cursor-pointer shadow-sm transition-all duration-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <MapPin className="text-primary h-4 w-4 shrink-0" />
                        <CardTitle className="text-base font-semibold">
                            {district}
                        </CardTitle>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>
                            {siteCount} {siteCount === 1 ? 'site' : 'sites'}
                        </span>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    );
}
