import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MissingSpecimensTooltipProps {
    specimensMissing: number;
    siteLabel: string;
}

export default function MissingSpecimensTooltip({
    specimensMissing,
    siteLabel,
}: MissingSpecimensTooltipProps) {
    const t = useTranslations('ReviewImage');

    if (specimensMissing <= 0) {
        return;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3" />
                    {t('missingSpecimensBadge')}
                </Badge>
            </TooltipTrigger>
            <TooltipContent>
                {t('specimensNotUploaded', {
                    count: specimensMissing,
                    site: siteLabel,
                })}
            </TooltipContent>
        </Tooltip>
    );
}
