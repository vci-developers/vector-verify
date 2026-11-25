'use client';

import {
    createContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ReleaseNoteSummary } from '../validation/release-note-summary-schema';
import { hasSeenRelease, markReleaseSeen } from '../lib/release-notes-storage';

export const ReleaseNotesDialogContext = createContext<{
    openDialog: () => void;
    triggerRef: RefObject<HTMLButtonElement | null>;
} | null>(null);

interface ReleaseNotesDialogProps {
    release: ReleaseNoteSummary | null;
    children: ReactNode;
}

export default function ReleaseNotesDialog({
    release,
    children,
}: ReleaseNotesDialogProps) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const t = useTranslations('ReleaseNotes');
    const format = useFormatter();
    const releaseId = release?.id;

    useEffect(() => {
        if (releaseId && !hasSeenRelease(releaseId)) {
            setOpen(true);
        }
    }, [releaseId]);

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen && release) {
            markReleaseSeen(release.id);
        }
        setOpen(nextOpen);
    }

    if (!release) {
        return children;
    }

    const date = format.dateTime(new Date(release.date), {
        dateStyle: 'long',
        timeZone: 'UTC',
    });
    const theme = release.title.replace(/^.*? - /, '');

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <ReleaseNotesDialogContext.Provider
                value={{ openDialog: () => setOpen(true), triggerRef }}
            >
                {children}
            </ReleaseNotesDialogContext.Provider>
            <DialogContent
                className="max-h-[85vh] overflow-y-auto sm:max-w-xl"
                onCloseAutoFocus={event => {
                    if (triggerRef.current) {
                        event.preventDefault();
                        triggerRef.current.focus();
                    }
                }}
            >
                <DialogHeader className="pr-6 text-left">
                    <DialogTitle>{t('title', { date })}</DialogTitle>
                    <DialogDescription>{theme}</DialogDescription>
                </DialogHeader>
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                    {release.changes.map(change => (
                        <li key={change.id}>
                            <a
                                className="text-foreground decoration-muted-foreground/50 hover:decoration-foreground focus-visible:ring-ring rounded-sm font-semibold underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
                                href={`/docs/release-notes/${release.id}#${change.id}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {change.title}
                            </a>{' '}
                            <span className="text-muted-foreground">
                                {change.summary}
                            </span>
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
}
