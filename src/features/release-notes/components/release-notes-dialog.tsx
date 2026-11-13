'use client';

import {
    createContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from 'react';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ReleaseNoteSummary } from '../validation/release-note-summary-schema';
import {
    hasSeenRelease,
    markReleaseSeen,
} from '../utils/release-notes-storage';

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
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>{release.title}</DialogDescription>
                </DialogHeader>
                <ul className="space-y-2">
                    {release.changes.map(change => (
                        <li key={change.id}>
                            <a
                                className="text-foreground hover:bg-accent focus-visible:ring-ring flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                href={`/docs/release-notes/${release.id}#${change.id}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className="min-w-0 space-y-1">
                                    <span className="block font-semibold">
                                        {change.title}
                                    </span>
                                    <span className="text-muted-foreground block text-sm">
                                        {change.summary}
                                    </span>
                                </span>
                                <ExternalLink
                                    aria-hidden="true"
                                    className="text-muted-foreground mt-1 ml-auto size-4 shrink-0"
                                />
                            </a>
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
}
