'use client';

import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import SpecimenImageCarousel from '@/components/specimen/specimen-image-carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';

interface SpecimenImageViewerProps {
    specimen?: Specimen | undefined;
    isLoading?: boolean;
    isError?: boolean;
}

export default function SpecimenImageViewer({
    specimen,
    isLoading,
    isError,
}: SpecimenImageViewerProps) {
    const site = specimen?.session?.site;
    const t = useTranslations('AnnotationWorkspace');

    return (
        <Card>
            <CardHeader className="pb-2">
                {isLoading || isError ? (
                    <Fragment>
                        <Skeleton
                            className="h-5 w-3/5 max-w-64"
                            variant={isError ? 'destructive' : 'default'}
                        />
                        <Skeleton
                            className="h-4 w-2/5 max-w-48"
                            variant={isError ? 'destructive' : 'default'}
                        />
                    </Fragment>
                ) : (
                    <Fragment>
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
                    </Fragment>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {isLoading || isError ? (
                    <Skeleton
                        className="aspect-4/3 w-full rounded-lg"
                        variant={isError ? 'destructive' : 'default'}
                    />
                ) : !specimen ? (
                    <div className="text-muted-foreground flex aspect-4/3 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                        {t('noSpecimenData')}
                    </div>
                ) : (
                    <SpecimenImageCarousel specimen={specimen} />
                )}

                <Separator />

                <div className="flex items-center gap-3">
                    <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    {isLoading || isError ? (
                        <Skeleton
                            className="h-4 w-full"
                            variant={isError ? 'destructive' : 'default'}
                        />
                    ) : (
                        <div>
                            {site ? (
                                <Fragment>
                                    {Object.keys(site.locationHierarchy)
                                        .length > 0 ? (
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
                                                {site.subCounty},{' '}
                                                {site.district}
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
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
