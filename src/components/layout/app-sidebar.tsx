'use client';

import { useUserPermissions } from '@/api/user/hooks/use-user-permissions';
import type { UserPermissions } from '@/api/user/validation/user-permissions-schema';
import { ClipboardCheck, PencilRuler } from 'lucide-react';
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
import { Avatar, AvatarImage } from '@/components/ui/avatar';

type NavigationItem = {
    name: string;
    href: string;
    icon: React.ComponentType;
    canAccess: (permissions: UserPermissions) => boolean;
};

const navigation: NavigationItem[] = [
    {
        name: 'Review',
        href: '/review_new',
        icon: ClipboardCheck,
        canAccess: permissions => permissions.sites.viewSiteMetadata,
    },
    {
        name: 'Annotate',
        href: '/annotate_new',
        icon: PencilRuler,
        canAccess: permissions =>
            permissions.annotations.viewAndWriteAnnotationTasks,
    },
];

export default function AppSidebar() {
    const pathname = usePathname();
    const { data: userPermissionsResult, isPending: isUserPermissionsPending } =
        useUserPermissions();

    if (isUserPermissionsPending || !userPermissionsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!userPermissionsResult.ok) {
        return <h1>ERROR: {userPermissionsResult.error.message}</h1>;
    }

    const userPermissions: UserPermissions =
        userPermissionsResult.data.permissions;

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
                                        isActive={pathname.startsWith(
                                            item.href,
                                        )}
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
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    );
}
