'use client';

import OperationsDistrictCard from './operations-district-card';

export interface LocationGroup {
    district: string;
    siteCount: number;
}

interface OperationsLocationListProps {
    locations: LocationGroup[];
}

export default function OperationsLocationList({
    locations,
}: OperationsLocationListProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {locations.map(({ district, siteCount }) => (
                <OperationsDistrictCard
                    key={district}
                    district={district}
                    siteCount={siteCount}
                />
            ))}
        </div>
    );
}
