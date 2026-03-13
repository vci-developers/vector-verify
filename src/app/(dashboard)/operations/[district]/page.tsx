interface OperationsDistrictPageProps {
    params: Promise<{ district: string }>;
}

export default async function OperationsDistrictPage({
    params,
}: OperationsDistrictPageProps) {
    const district = decodeURIComponent((await params).district);

    return <h1>{district}</h1>;
}
