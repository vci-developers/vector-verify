'use client';

import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { logout } from '@/lib/auth-session/logout';
import { LogOut } from 'lucide-react';
import { clearSendEmailCooldown } from '@/lib/hooks/use-resend-cooldown';

export default function LogoutButton() {
    const queryClient = useQueryClient();

    async function handleLogout() {
        queryClient.clear();
        clearSendEmailCooldown();
        await logout();
    }

    return (
        <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-destructive hover:text-destructive w-full justify-center"
        >
            <LogOut className="mr-2 h-4 w-4 text-inherit" />
            Log out
        </Button>
    );
}
