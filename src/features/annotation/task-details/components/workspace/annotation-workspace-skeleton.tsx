import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnnotationWorkspaceSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-4 w-24" />

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="aspect-square w-full rounded-md" />
                        <Separator />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Annotation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        ))}
                        <Skeleton className="h-9 w-24" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
