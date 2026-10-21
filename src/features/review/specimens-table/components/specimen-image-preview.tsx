'use client';

import { useState } from 'react';
import { useGetSpecimenImages } from '@/api/specimen/hooks/use-get-specimen-images';
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
import ErrorBanner from '@/components/ui/error-banner';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SpecimenImagePreview({
    specimen,
}: {
    specimen: Specimen;
}) {
    const t = useTranslations('ReviewSpecimens');
    const [open, setOpen] = useState(false);
    const {
        data: result,
        isPending,
        isError,
    } = useGetSpecimenImages(specimen.id, open);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                {isError || (result && !result.ok) ? (
                    <ErrorBanner message={t('imagesError')} />
                ) : isPending || !result ? (
                    <SkeletonList count={1} height="xxl" width="full" />
                ) : (
                    <SpecimenImageCarousel
                        enableKeyboardNavigation
                        specimen={{
                            ...specimen,
                            ...result.data,
                            thumbnailImage: null,
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
