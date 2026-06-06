import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';
import {
    CheckCircle2,
    ClipboardList,
    Clock,
    Send,
    Sparkles,
    TimerOff,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import type { Dhis2SyncSiteStatus } from '../utils/dhis2-sync-site-status';

const STATUS_BADGE_CONFIG: Record<
    Dhis2SyncSiteStatus,
    {
        label: string;
        variant: React.ComponentProps<typeof Badge>['variant'];
        className?: string;
        icon?: LucideIcon;
        showSpinner?: boolean;
    }
> = {
    reviewPending: {
        label: 'Review needed',
        variant: 'outline',
        className: 'bg-warning/10 text-warning-foreground border-warning/40',
        icon: ClipboardList,
    },
    ready: {
        label: 'Ready',
        variant: 'outline',
        icon: Send,
    },
    queued: {
        label: 'Queued',
        variant: 'secondary',
        icon: Clock,
    },
    running: {
        label: 'Running',
        variant: 'secondary',
        showSpinner: true,
    },
    submitted: {
        label: 'Submitted',
        variant: 'outline',
        className: 'bg-success/10 text-success border-success/50',
        icon: CheckCircle2,
    },
    failed: {
        label: 'Failed',
        variant: 'destructive',
        icon: XCircle,
    },
    timedOut: {
        label: 'Timed out',
        variant: 'outline',
        className: 'bg-warning/20 text-warning-foreground border-warning/50',
        icon: TimerOff,
    },
    hasNewCertifiedData: {
        label: 'New data to submit',
        variant: 'outline',
        className: 'bg-primary/10 text-primary border-primary/40',
        icon: Sparkles,
    },
};

interface Dhis2SyncSiteStatusBadgeProps {
    status: Dhis2SyncSiteStatus;
}

export default function Dhis2SyncSiteStatusBadge({
    status,
}: Dhis2SyncSiteStatusBadgeProps) {
    const config = STATUS_BADGE_CONFIG[status];
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className={cn(config.className)}>
            {config.showSpinner && <Spinner className="size-3" />}
            {Icon && <Icon />}
            {config.label}
        </Badge>
    );
}
