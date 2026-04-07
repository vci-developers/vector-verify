import type { LucideIcon } from 'lucide-react';

interface PageShellProps {
    title: string;
    icon: LucideIcon;
    description?: string;
    children: React.ReactNode;
}

export default function PageShell({
    title,
    icon: Icon,
    description,
    children,
}: PageShellProps) {
    return (
        <div className="from-background via-background to-muted/30 flex h-screen flex-1 flex-col bg-linear-to-br">
            <div className="container mx-auto flex max-w-6xl flex-1 flex-col gap-6 overflow-hidden px-4 py-8">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-muted-foreground text-sm">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {children}
            </div>
        </div>
    );
}
