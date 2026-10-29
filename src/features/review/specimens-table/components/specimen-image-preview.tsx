'use client';

import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import SpecimenImageCarousel from '@/components/specimen/specimen-image-carousel';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SpecimenImagePreview({
    specimen,
}: {
    specimen: Specimen;
}) {
    const t = useTranslations('ReviewSpecimens');
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('preview', {
                        specimenId: specimen.specimenId,
                    })}
                >
                    <Search className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {t('preview', { specimenId: specimen.specimenId })}
                    </DialogTitle>
                    <DialogDescription>
                        {t('previewDescription')}
                    </DialogDescription>
                </DialogHeader>
                <SpecimenImageCarousel
                    enableKeyboardNavigation
                    specimen={specimen}
                />
            </DialogContent>
        </Dialog>
    );
}
