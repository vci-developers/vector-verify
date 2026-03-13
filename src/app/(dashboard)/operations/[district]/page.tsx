import OperationsLocationPageClient from '@/features/operations/components/location/operations-location-page-client';

interface OperationsLocationPageProps {
    params: Promise<{ district: string }>;
}

export default async function OperationsLocationPage({
    params,
}: OperationsLocationPageProps) {
    const location = decodeURIComponent((await params).district);

    return <OperationsLocationPageClient location={location} />;
}
