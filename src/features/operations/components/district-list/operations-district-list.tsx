'use client';

import type { DistrictInfo } from '@/features/operations/hooks/use-district-list';
import OperationsDistrictCard from './operations-district-card';

interface OperationsDistrictListProps {
    districts: DistrictInfo[];
}

export default function OperationsDistrictList({
    districts,
}: OperationsDistrictListProps) {
    if (districts.length === 0) {
        return (
            <p className="text-muted-foreground py-12 text-center text-sm">
                No districts available.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {districts.map(({ district, siteCount }) => (
                <OperationsDistrictCard
                    key={district}
                    district={district}
                    siteCount={siteCount}
                />
            ))}
        </div>
    );
}
