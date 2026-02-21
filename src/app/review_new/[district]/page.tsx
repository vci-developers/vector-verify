import { Fragment } from 'react';

interface ReviewDistrictPageProps {
    params: Promise<{
        district: string;
    }>;
}

export default async function ReviewDistrictPage({
    params,
}: ReviewDistrictPageProps) {
    const { district } = await params;

    return (
        <Fragment>
            <h1>Reviewing {district}</h1>
        </Fragment>
    );
}
