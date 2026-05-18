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
import type { SiteIrsFormData } from '@/features/review/export/utils/build-site-irs-data';
import SiteIrsRow from '@/features/review/export/components/site-irs-row';

interface ExportConfirmDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    selectedSites: Map<string, Set<number>>;
    sites: Site[];
    selectedCount: number;
    onConfirm: (siteIrsData: Map<number, SiteIrsFormData>) => void;
}

function initSiteIrsData(
    selectedSites: Map<string, Set<number>>,
): Map<number, SiteIrsFormData> {
    const data = new Map<number, SiteIrsFormData>();
    for (const siteIdSet of selectedSites.values()) {
        for (const siteId of siteIdSet) {
            data.set(siteId, {
                siteId,
                wasIrsSprayed: false,
                insecticideSprayed: '',
                dateLastSprayed: '',
            });
        }
    }
    return data;
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
    const [siteIrsData, setSiteIrsData] = useState<
        Map<number, SiteIrsFormData>
    >(() => initSiteIrsData(selectedSites));

    useEffect(() => {
        if (!isOpen) return;
        setStep(1);
        setSiteIrsData(initSiteIrsData(selectedSites));
    }, [isOpen, selectedSites]);

    const siteById = useMemo(
        () => new Map(sites.map(site => [site.siteId, site])),
        [sites],
    );

    const monthKeys = useMemo(
        () => [...selectedSites.keys()].sort(),
        [selectedSites],
    );

    function updateSiteIrs(siteId: number, patch: Partial<SiteIrsFormData>) {
        setSiteIrsData(prev => {
            const next = new Map(prev);
            const current = next.get(siteId);
            if (current) next.set(siteId, { ...current, ...patch });
            return next;
        });
    }

    function isFormValid(): boolean {
        for (const entry of siteIrsData.values()) {
            if (entry.wasIrsSprayed) {
                if (!entry.insecticideSprayed.trim()) return false;
                const parsed = parseISO(entry.dateLastSprayed);
                if (
                    !isValid(parsed) ||
                    parsed.getFullYear() < 2000 ||
                    parsed > new Date()
                )
                    return false;
            }
        }
        return true;
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
                                {monthKeys.map(monthKey => {
                                    const siteIds = [
                                        ...(selectedSites.get(monthKey) ?? []),
                                    ];
                                    if (siteIds.length === 0) return null;
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
                                            {siteIds.map(siteId => {
                                                const entry =
                                                    siteIrsData.get(siteId);
                                                const site =
                                                    siteById.get(siteId);
                                                const siteName =
                                                    site?.name ??
                                                    site?.villageName ??
                                                    String(siteId);
                                                if (!entry) return null;
                                                return (
                                                    <div
                                                        key={siteId}
                                                        className="space-y-2"
                                                    >
                                                        <p className="text-sm font-medium">
                                                            {siteName}
                                                        </p>
                                                        <SiteIrsRow
                                                            entry={entry}
                                                            onUpdate={patch =>
                                                                updateSiteIrs(
                                                                    siteId,
                                                                    patch,
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
                                disabled={!isFormValid()}
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
                                {selectedCount !== 1 ? 's' : ''} to DHIS2.
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
                            <Button onClick={() => onConfirm(siteIrsData)}>
                                Start export
                            </Button>
                        </DialogFooter>
                    </Fragment>
                )}
            </DialogContent>
        </Dialog>
    );
}
