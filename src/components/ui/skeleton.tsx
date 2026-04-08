import { cn } from '@/utils/cn';

const HEIGHTS = {
    xs: 'h-3',
    sm: 'h-4',
    md: 'h-5',
    lg: 'h-8',
    xl: 'h-14',
    xxl: 'h-16',
} as const;

const WIDTHS = {
    xs: 'w-12',
    sm: 'w-20',
    md: 'w-32',
    lg: 'w-48',
    xl: 'w-64',
    full: 'w-full',
} as const;

const VARIANTS = {
    default: 'bg-accent',
    destructive: 'bg-destructive/15',
    warning: 'bg-warning/15',
    success: 'bg-success/15',
} as const;

const ROUNDED = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
} as const;

interface SkeletonProps extends React.ComponentProps<'div'> {
    height?: keyof typeof HEIGHTS;
    width?: keyof typeof WIDTHS;
    variant?: keyof typeof VARIANTS;
    rounded?: keyof typeof ROUNDED;
    animated?: boolean;
}

function Skeleton({
    className,
    height,
    width,
    variant = 'default',
    rounded = 'md',
    animated = true,
    ...props
}: SkeletonProps) {
    return (
        <div
            data-slot="skeleton"
            className={cn(
                VARIANTS[variant],
                ROUNDED[rounded],
                animated && 'animate-pulse',
                height && HEIGHTS[height],
                width && WIDTHS[width],
                className,
            )}
            {...props}
        />
    );
}

export { Skeleton };
