import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpeciesConfusionMatrixStateCardProps {
    message: string;
}

export default function SpeciesConfusionMatrixStateCard({
    message,
}: SpeciesConfusionMatrixStateCardProps) {
    return (
        <Card className="gap-0 lg:col-span-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">Confusion Matrix</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
                    {message}
                </div>
            </CardContent>
        </Card>
    );
}
