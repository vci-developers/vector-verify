'use client';

import type { Annotation } from '@/api/annotation/validation/annotation-schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Pencil } from 'lucide-react';
import { Fragment } from 'react';
import { deserializeAnnotationFormArtifacts } from '@/features/annotation/task-details/lib/annotation-form-artifacts-serializer';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface AnnotationReadonlyViewProps {
    annotation: Annotation | undefined;
    onEdit: () => void;
    isLoading: boolean;
    isError: boolean;
}

export default function AnnotationReadonlyView({
    annotation,
    onEdit,
    isLoading,
    isError,
}: AnnotationReadonlyViewProps) {
    const annotationFormArtifacts =
        deserializeAnnotationFormArtifacts(annotation?.artifacts) ?? [];

    const visualAnnotations = [
        { label: 'Species', value: annotation?.visualSpecies ?? '---' },
        { label: 'Sex', value: annotation?.visualSex ?? '---' },
        {
            label: 'Abdomen Status',
            value: annotation?.visualAbdomenStatus ?? '---',
        },
    ];

    const showArtifacts = isLoading || annotationFormArtifacts.length > 0;
    const showNotes = isLoading || !!annotation?.notes;

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Annotation</CardTitle>
                    {!isLoading && !isError && (
                        <Button variant="outline" size="icon" onClick={onEdit}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {visualAnnotations.map(({ label, value }) => (
                        <div
                            key={label}
                            className="flex items-center justify-between"
                        >
                            <p className="text-muted-foreground text-sm">
                                {label}
                            </p>
                            {isLoading ? (
                                <Skeleton className="h-4 w-20" />
                            ) : (
                                <p className="text-sm font-medium">{value}</p>
                            )}
                        </div>
                    ))}
                </div>

                {showArtifacts && (
                    <Fragment>
                        <Separator />
                        <div>
                            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                                Artifacts
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {isLoading ? (
                                    <Skeleton className="h-4 w-full" />
                                ) : (
                                    annotationFormArtifacts.map(artifact => (
                                        <Badge
                                            key={artifact}
                                            variant="secondary"
                                        >
                                            {artifact}
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </div>
                    </Fragment>
                )}

                {showNotes && (
                    <Fragment>
                        <Separator />
                        <div>
                            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                                Notes
                            </p>
                            {isLoading ? (
                                <Skeleton className="h-8 w-full" />
                            ) : (
                                <p className="text-sm">{annotation?.notes}</p>
                            )}
                        </div>
                    </Fragment>
                )}
            </CardContent>
        </Card>
    );
}
