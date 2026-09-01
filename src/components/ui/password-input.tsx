'use client';

import * as React from 'react';
import { Eye, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

function PasswordInput({
    className,
    ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
    const [visible, setVisible] = React.useState(false);

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
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                className="hover:bg-accent absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
            >
                <Eye className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
            </Button>
        </div>
    );
}

export { PasswordInput };
