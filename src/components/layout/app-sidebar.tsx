'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import type { UserPermissions } from '@/api/user/validation/user-permissions-schema';
import {
    ChevronUp,
    ClipboardCheck,
    LayoutDashboard,
    Moon,
    PencilRuler,
    Microscope,
    Sun,
    type LucideIcon,
    Code2,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { UserProfile } from '@/api/user/validation/user-profile-schema';
import LogoutButton from '../auth-session/logout-button';
import LocaleSwitcher from './locale-switcher';
import { Badge } from '../ui/badge';
import { Fragment, useState } from 'react';
import RawDataExportDialog from '../raw-export/raw-data-export-dialog';

type NavigationItem = {
    name: string;
    href: string;
    icon: LucideIcon;
    canAccess: (permissions: UserPermissions) => boolean;
};

const navigation: NavigationItem[] = [
    {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        canAccess: () => true,
    },
    {
        name: 'Review',
        href: '/review',
        icon: ClipboardCheck,
        canAccess: permissions => permissions.sites.writeSiteMetadata,
    },
    {
        name: 'Operations',
        href: '/operations',
        icon: Microscope,
        canAccess: permissions => permissions.sites.viewSiteMetadata,
    },
    {
        name: 'Annotate',
        href: '/annotate',
        icon: PencilRuler,
        canAccess: permissions =>
            permissions.annotations.viewAndWriteAnnotationTasks,
    },
];

interface AppSidebarProps {
    userProfile: UserProfile;
}

export default function AppSidebar({ userProfile }: AppSidebarProps) {
    const pathname = usePathname();
    const { resolvedTheme, setTheme } = useTheme();
    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();

    const [isRawDataExportOpen, setIsRawDataExportOpen] = useState(false);

    const isDark = resolvedTheme === 'dark';
    const ThemeIcon = isDark ? Sun : Moon;

    function handleThemeToggle() {
        setTheme(isDark ? 'light' : 'dark');
    }

    if (isGetUserPermissionsPending || !getUserPermissionsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getUserPermissionsResult.ok) {
        return <h1>ERROR: {getUserPermissionsResult.error.message}</h1>;
    }

    const userPermissions: UserPermissions =
        getUserPermissionsResult.data.permissions;

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <div className="flex flex-col items-center gap-2 px-4 pt-4 pb-2">
                    <Avatar className="bg-muted h-14 w-14 transition-[width,height] duration-300 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8">
                        <AvatarImage
                            src="/assets/auth/images/logo.png"
                            alt="VectorVerify logo"
                            className="h-full w-full object-contain"
                        />
                    </Avatar>
                    <span className="text-muted-foreground text-lg font-semibold group-data-[state=collapsed]:hidden">
                        VectorVerify
                    </span>
                </div>
                <SidebarGroup>
                    <SidebarMenu>
                        {navigation
                            .filter(item =>
                                item.canAccess
                                    ? item.canAccess(userPermissions)
                                    : true,
                            )
                            .map(item => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={
                                            item.href === '/'
                                                ? pathname === '/'
                                                : pathname.startsWith(item.href)
                                        }
                                    >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                    </SidebarMenu>
                </SidebarGroup>

                <div className="mt-auto p-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="hover:bg-accent/60 h-auto w-full justify-start gap-3 px-2 py-2 group-data-[state=collapsed]:justify-center"
                            >
                                <Avatar className="border-primary/40 h-9 w-9 border">
                                    <AvatarFallback className="font-semibold">
                                        {userProfile.email
                                            .charAt(0)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1 group-data-[state=collapsed]:hidden">
                                    <div className="truncate text-sm font-medium">
                                        {userProfile.name ??
                                            userProfile.email.split('@')[0]}
                                    </div>
                                </div>

                                <ChevronUp className="text-muted-foreground h-4 w-4 group-data-[state=collapsed]:hidden" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-start gap-2 px-2 py-2">
                                    <Avatar className="border-primary/40 h-9 w-9 border">
                                        <AvatarFallback className="font-semibold">
                                            {userProfile.email
                                                .charAt(0)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex min-w-0 flex-col gap-1">
                                        <span className="truncate text-sm leading-none font-medium">
                                            {userProfile.name ??
                                                userProfile.email.split('@')[0]}
                                        </span>
                                        <span className="text-muted-foreground truncate text-xs leading-none">
                                            {userProfile.email}
                                        </span>
                                        {userPermissions.devMode && (
                                            <Badge
                                                variant="secondary"
                                                className="mt-1"
                                            >
                                                <Code2 />
                                                Developer Mode
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-muted-foreground py-1 text-xs font-normal">
                                    Preferences
                                </DropdownMenuLabel>
                                <DropdownMenuItem onClick={handleThemeToggle}>
                                    <ThemeIcon className="h-4 w-4" />
                                    {isDark ? 'Light mode' : 'Dark mode'}
                                </DropdownMenuItem>
                                <LocaleSwitcher />
                            </DropdownMenuGroup>

                            {userPermissions.devMode && (
                                <Fragment>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onSelect={() =>
                                            setIsRawDataExportOpen(true)
                                        }
                                    >
                                        <Code2 className="h-4 w-4" />
                                        Raw Data Export
                                    </DropdownMenuItem>
                                </Fragment>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild>
                                <LogoutButton />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {userPermissions.devMode && (
                        <RawDataExportDialog
                            open={isRawDataExportOpen}
                            onOpenChange={setIsRawDataExportOpen}
                            programId={getUserPermissionsResult.data.programId}
                        />
                    )}
                </div>
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    );
}
