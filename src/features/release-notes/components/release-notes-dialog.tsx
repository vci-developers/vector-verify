'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { ReleaseNoteSummary } from '../server/get-release-notes';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

interface ReleaseNotesDialogProps {
    release: ReleaseNoteSummary;
}

export default function ReleaseNotesDialog({
    release,
}: ReleaseNotesDialogProps) {
    const [open, setOpen] = useState(false);
    const t = useTranslations('ReleaseNotes');
    const tSidebar = useTranslations('Sidebar');

    useEffect(() => {
        if (
            window.localStorage.getItem(`release-notes-seen:${release.id}`) !==
            'true'
        ) {
            setOpen(true);
        }
    }, [release.id]);

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            window.localStorage.setItem(
                `release-notes-seen:${release.id}`,
                'true',
            );
        }
        setOpen(nextOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <SidebarMenuItem>
                <DialogTrigger asChild>
                    <SidebarMenuButton>
                        <Sparkles />
                        <span>{tSidebar('whatsNew')}</span>
                    </SidebarMenuButton>
                </DialogTrigger>
            </SidebarMenuItem>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>{release.title}</DialogDescription>
                </DialogHeader>
                <ul className="space-y-4">
                    {release.changes.map(change => (
                        <li key={change.id}>
                            <a
                                className="text-primary hover:underline"
                                href={`/docs/release-notes/${release.id}#${change.id}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className="font-semibold">
                                    {change.title}
                                </span>
                                <span>: {change.summary}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
}
