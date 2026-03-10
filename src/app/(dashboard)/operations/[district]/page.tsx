interface OperationsDistrictPageProps {
    params: Promise<{ district: string }>;
}

export default async function OperationsDistrictPage({
    params,
}: OperationsDistrictPageProps) {
    const { district } = await params;
    const decodedDistrict = decodeURIComponent(district);

    return <h1>{decodedDistrict}</h1>;
}
