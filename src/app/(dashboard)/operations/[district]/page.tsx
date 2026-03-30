import OperationsLocationView from '@/features/operations/components/location/operations-location-page';

interface OperationsLocationPageProps {
    params: Promise<{ district: string }>;
}

export default async function OperationsLocationPage({
    params,
}: OperationsLocationPageProps) {
    const location = decodeURIComponent((await params).district);

    return <OperationsLocationView location={location} />;
}
