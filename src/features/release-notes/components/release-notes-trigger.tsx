'use client';

import { useContext } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ReleaseNotesDialogContext } from './release-notes-dialog';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export default function ReleaseNotesTrigger() {
    const t = useTranslations('Sidebar');
    const dialog = useContext(ReleaseNotesDialogContext);

    if (!dialog) {
        throw new Error('ReleaseNotesTrigger must be inside ReleaseNotesDialog.');
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                ref={dialog.triggerRef}
                onClick={dialog.openDialog}
                aria-haspopup="dialog"
            >
                <Sparkles />
                <span>{t('whatsNew')}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
