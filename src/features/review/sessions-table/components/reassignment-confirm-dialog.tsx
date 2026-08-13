'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface ReassignmentConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isPending: boolean;
}

export default function ReassignmentConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    isPending,
}: ReassignmentConfirmDialogProps) {
    const t = useTranslations('ReviewSessionsTable');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('reassignConfirmTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('reassignConfirmDescription')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        {t('reassignCancel')}
                    </Button>
                    <Button onClick={onConfirm} disabled={isPending}>
                        {isPending
                            ? t('reassignConfirming')
                            : t('reassignConfirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
