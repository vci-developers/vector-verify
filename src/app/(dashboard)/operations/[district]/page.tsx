import OperationsDataTablePageClient from "@/features/operations/components/details-list/operations-data-table-page-client";

interface OperationsDetailsPageProps {
    params: Promise<{
        district: string;
    }>;
}

export default async function OperationsDetailsPage({
    params
}: OperationsDetailsPageProps) {
    const district = (await params).district;

    return <OperationsDataTablePageClient district={district} />;
}
