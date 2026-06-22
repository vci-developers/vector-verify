import LogoutButton from '@/components/auth-session/logout-button';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';
import Link from 'next/link';

export default function ForbiddenPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-6">
            <div className="bg-destructive/10 rounded-full p-6">
                <ShieldX className="text-destructive h-12 w-12" />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-semibold">Access Denied</h1>
                <p className="text-muted-foreground max-w-sm text-sm">
                    You don&apos;t have permission to view this page. Contact
                    our technical team if you think this is a mistake.
                </p>
            </div>
            <div className="flex flex-col items-center gap-4">
                <Button asChild variant="outline" className="w-full">
                    {/* TODO: Revert to "/" / Return to Dashboard once the dashboard is restored. */}
                    <Link href="/operations">Return to Operations</Link>
                </Button>
                <LogoutButton />
            </div>
        </div>
    );
}
