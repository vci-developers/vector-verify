'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { UserProfile } from '@/api/user/validation/user-profile-schema';
import { useQueryClient } from '@tanstack/react-query';

interface AppHeaderProps {
    userProfile: UserProfile;
    onLogout: () => Promise<void>;
}

export default function AppHeader({ userProfile, onLogout }: AppHeaderProps) {
    const queryClient = useQueryClient();

    async function handleLogout() {
        queryClient.clear();
        await onLogout();
    }

    return (
        <header className="bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
            <div className="flex h-14 items-center px-6">
                <div className="ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-9 w-9 rounded-full p-0"
                            >
                                <Avatar className="border-primary h-8 w-8 border">
                                    <AvatarFallback>
                                        {userProfile.email.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>
                                {userProfile.email}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive"
                            >
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
