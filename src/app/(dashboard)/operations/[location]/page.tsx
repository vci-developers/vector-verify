import OperationsLocationView from '@/features/operations/components/location/operations-location-page';

interface OperationsLocationPageProps {
    params: Promise<{ location: string }>;
}

export default async function OperationsLocationPage({
    params,
}: OperationsLocationPageProps) {
    const location = decodeURIComponent((await params).location);

    return <OperationsLocationView location={location} />;
}
