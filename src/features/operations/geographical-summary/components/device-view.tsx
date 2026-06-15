import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';

export default function DeviceView() {
    const t = useTranslations('OperationsGeographicalSummary');

    return (
        <Card className="border-border/50 p-0">
            <CardContent className="text-muted-foreground flex h-125 items-center justify-center p-0 text-sm">
                {t('noDeviceActivity')}
            </CardContent>
        </Card>
    );
}
