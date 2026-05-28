'use client';

import { Fragment, useState, useMemo, useEffect } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Site } from '@/api/site/validation/site-schema';
import SiteIrsRow from '@/features/review/export/components/site-irs-row';
import type { SiteIrsData } from '@/api/dhis2/validation/post-dhis2-uganda-schema';

interface ExportConfirmDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    selectedSites: Map<string, Set<number>>;
    sites: Site[];
    selectedCount: number;
    onConfirm: (irsDataBySiteId: Map<number, SiteIrsData>) => void;
}

export default function ExportConfirmDialog({
    isOpen,
    onOpenChange,
    selectedSites,
    sites,
    selectedCount,
    onConfirm,
}: ExportConfirmDialogProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [irsFormBySiteId, setIrsFormBySiteId] = useState(() => {
        const initialIrsFormBySiteId = new Map<
            number,
            {
                wasIrsSprayed: boolean;
                insecticideSprayed: string;
                dateLastSprayed: string;
            }
        >();
        for (const siteIds of selectedSites.values()) {
            for (const siteId of siteIds) {
                initialIrsFormBySiteId.set(siteId, {
                    wasIrsSprayed: false,
                    insecticideSprayed: '',
                    dateLastSprayed: '',
                });
            }
        }
        return initialIrsFormBySiteId;
    });

    useEffect(() => {
        if (!isOpen) return;
        setStep(1);
        const emptyFormBySiteId = new Map<
            number,
            {
                wasIrsSprayed: boolean;
                insecticideSprayed: string;
                dateLastSprayed: string;
            }
        >();
        for (const siteIds of selectedSites.values()) {
            for (const siteId of siteIds) {
                emptyFormBySiteId.set(siteId, {
                    wasIrsSprayed: false,
                    insecticideSprayed: '',
                    dateLastSprayed: '',
                });
            }
        }
        setIrsFormBySiteId(emptyFormBySiteId);
    }, [isOpen, selectedSites]);

    const siteById = useMemo(
        () => new Map(sites.map(site => [site.siteId, site])),
        [sites],
    );

    const sortedMonthKeys = useMemo(
        () => [...selectedSites.keys()].sort(),
        [selectedSites],
    );

    function updateSiteIrsForm(
        siteId: number,
        nextForm: {
            wasIrsSprayed: boolean;
            insecticideSprayed: string;
            dateLastSprayed: string;
        },
    ) {
        setIrsFormBySiteId(previousForm =>
            new Map(previousForm).set(siteId, nextForm),
        );
    }

    function isIrsFormValid(): boolean {
        for (const form of irsFormBySiteId.values()) {
            if (!form.wasIrsSprayed) continue;
            if (!form.insecticideSprayed.trim()) return false;
            const parsedDate = parseISO(form.dateLastSprayed);
            if (
                !isValid(parsedDate) ||
                parsedDate.getFullYear() < 2000 ||
                parsedDate > new Date()
            ) {
                return false;
            }
        }
        return true;
    }

    function handleStartExport() {
        const irsDataBySiteId = new Map<number, SiteIrsData>();
        for (const [siteId, form] of irsFormBySiteId) {
            irsDataBySiteId.set(
                siteId,
                form.wasIrsSprayed
                    ? {
                          siteId,
                          wasIrsSprayed: true,
                          insecticideSprayed:
                              form.insecticideSprayed || undefined,
                          dateLastSprayed: form.dateLastSprayed || undefined,
                      }
                    : { siteId, wasIrsSprayed: false },
            );
        }
        onConfirm(irsDataBySiteId);
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={open => {
                onOpenChange(open);
                if (!open) setStep(1);
            }}
        >
            <DialogContent showCloseButton={false} className="max-w-2xl">
                {step === 1 ? (
                    <Fragment>
                        <DialogHeader>
                            <DialogTitle>IRS Information</DialogTitle>
                            <DialogDescription>
                                For each site, indicate whether Indoor Residual
                                Spraying (IRS) was conducted. If yes, provide
                                the insecticide and date.
                            </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-6">
                                {sortedMonthKeys.map(monthKey => {
                                    const siteIdsForMonth = [
                                        ...(selectedSites.get(monthKey) ?? []),
                                    ];
                                    if (siteIdsForMonth.length === 0)
                                        return null;
                                    const [year, month] = monthKey.split('-');
                                    const monthLabel = format(
                                        new Date(
                                            Number(year),
                                            Number(month) - 1,
                                            1,
                                        ),
                                        'MMMM yyyy',
                                    );
                                    return (
                                        <div
                                            key={monthKey}
                                            className="space-y-3"
                                        >
                                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                                {monthLabel}
                                            </p>
                                            {siteIdsForMonth.map(siteId => {
                                                const form =
                                                    irsFormBySiteId.get(siteId);
                                                const site =
                                                    siteById.get(siteId);
                                                const siteName =
                                                    site?.name ??
                                                    site?.villageName ??
                                                    String(siteId);
                                                if (!form) return null;
                                                return (
                                                    <div
                                                        key={siteId}
                                                        className="space-y-2"
                                                    >
                                                        <p className="text-sm font-medium">
                                                            {siteName}
                                                        </p>
                                                        <SiteIrsRow
                                                            siteId={siteId}
                                                            wasIrsSprayed={
                                                                form.wasIrsSprayed
                                                            }
                                                            insecticideSprayed={
                                                                form.insecticideSprayed
                                                            }
                                                            dateLastSprayed={
                                                                form.dateLastSprayed
                                                            }
                                                            onChange={nextForm =>
                                                                updateSiteIrsForm(
                                                                    siteId,
                                                                    nextForm,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!isIrsFormValid()}
                                onClick={() => setStep(2)}
                            >
                                Next
                            </Button>
                        </DialogFooter>
                    </Fragment>
                ) : (
                    <Fragment>
                        <DialogHeader>
                            <DialogTitle>Export to DHIS2</DialogTitle>
                            <DialogDescription>
                                You are about to export {selectedCount} site
                                {selectedCount === 1 ? '' : 's'} to DHIS2.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 text-sm">
                            <p className="text-destructive font-medium">
                                This may take a while. Do not close this tab or
                                your computer during the export.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleStartExport}>
                                Start export
                            </Button>
                        </DialogFooter>
                    </Fragment>
                )}
            </DialogContent>
        </Dialog>
    );
}
