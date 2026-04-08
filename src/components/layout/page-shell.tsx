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
        <div className="from-background via-background to-muted/30 min-h-screen bg-linear-to-br">
            <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
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
