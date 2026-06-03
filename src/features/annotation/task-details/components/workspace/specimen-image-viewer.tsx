'use client';

import { useGetSpecimenById } from '@/api/specimen/hooks/use-get-specimen-by-id';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import SpecimenImageCarousel from '@/components/specimen/specimen-image-carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin } from 'lucide-react';
import { Fragment } from 'react';

interface SpecimenImageViewerProps {
    specimen: Specimen;
}

export default function SpecimenImageViewer({
    specimen,
}: SpecimenImageViewerProps) {
    const { data: getSpecimenByIdResult } = useGetSpecimenById(specimen.id);

    const currentSpecimen =
        getSpecimenByIdResult?.ok === true
            ? getSpecimenByIdResult.data
            : specimen;
    const site = specimen.session?.site;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">
                    Specimen ID: {specimen?.specimenId ?? '---'}
                </CardTitle>
                {specimen?.session?.collectionDate && (
                    <p className="text-muted-foreground text-sm">
                        Collection Date:{' '}
                        {new Date(
                            specimen.session.collectionDate,
                        ).toLocaleDateString()}
                    </p>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                <SpecimenImageCarousel specimen={currentSpecimen} />

                <Separator />

                <div className="flex items-center gap-3">
                    <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                        {site ? (
                            <Fragment>
                                {Object.keys(site.locationHierarchy).length >
                                0 ? (
                                    <Fragment>
                                        <p className="text-sm font-medium">
                                            {site.name}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {Object.values(
                                                site.locationHierarchy,
                                            )
                                                .filter(
                                                    value =>
                                                        value !== site.name,
                                                )
                                                .join(', ')}
                                        </p>
                                    </Fragment>
                                ) : (
                                    <Fragment>
                                        <p className="text-sm font-medium">
                                            House #{site.houseNumber},{' '}
                                            {site.villageName}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {site.subCounty}, {site.district}
                                        </p>
                                    </Fragment>
                                )}
                            </Fragment>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                No location data
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
