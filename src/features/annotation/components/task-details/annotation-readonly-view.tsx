'use client';

import type { Annotation } from '@/api/annotation/validation/annotation-schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Pencil } from 'lucide-react';
import { Fragment } from 'react';

interface AnnotationReadonlyViewProps {
    annotation: Annotation;
    onEdit: () => void;
}

export default function AnnotationReadonlyView({
    annotation,
    onEdit,
}: AnnotationReadonlyViewProps) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Annotation</CardTitle>
                    <Button variant="outline" size="icon" onClick={onEdit}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm">Species</p>
                        <p className="text-sm font-medium">
                            {annotation.visualSpecies ?? '---'}
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm">Sex</p>
                        <p className="text-sm font-medium">
                            {annotation.visualSex ?? '---'}
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm">
                            Abdomen Status
                        </p>
                        <p className="text-sm font-medium">
                            {annotation.visualAbdomenStatus ?? '---'}
                        </p>
                    </div>
                </div>

                {annotation.notes && (
                    <Fragment>
                        <Separator />
                        <div>
                            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                                Notes
                            </p>
                            <p className="text-sm">{annotation.notes}</p>
                        </div>
                    </Fragment>
                )}
            </CardContent>
        </Card>
    );
}
