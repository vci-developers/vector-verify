'use client';

import * as React from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

function PasswordInput({
    className,
    ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
    const [pinned, setPinned] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(false);
    const visible = pinned || isVisible;
    const EyeIcon = visible ? EyeOff : Eye;

    return (
        <div className="relative">
            <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
                {...props}
                type={visible ? 'text' : 'password'}
                className={cn('pl-10', className)}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-pressed={pinned}
                onClick={() => setPinned(pinned => !pinned)}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                className={cn(
                    'hover:bg-accent absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 transition-transform active:scale-90',
                    pinned && 'bg-accent',
                )}
            >
                <EyeIcon
                    className={cn(
                        'text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors',
                        pinned && 'text-primary',
                    )}
                />
            </Button>
        </div>
    );
}

export { PasswordInput };
