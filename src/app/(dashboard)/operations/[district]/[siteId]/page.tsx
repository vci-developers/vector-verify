import OperationsLocationPage from '@/features/operations/components/location/operations-location-page';

interface OperationsLocationRouteProps {
    params: Promise<{
        district: string;
    }>;
}

export default async function OperationsLocationRoute({
    params,
}: OperationsLocationRouteProps) {
    const district = decodeURIComponent((await params).district);

    return <OperationsLocationPage district={district} />;
}
