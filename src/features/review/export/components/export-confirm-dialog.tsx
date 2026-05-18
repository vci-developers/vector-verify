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
import type { VillageIrsFormData } from '../utils/build-site-irs-data';
import SiteIrsRow from './site-irs-row';

interface ExportConfirmDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    selectedSites: Map<string, Set<number>>;
    sites: Site[];
    selectedCount: number;
    onConfirm: (irsData: VillageIrsFormData[]) => void;
}

function initFormData(
    selectedSites: Map<string, Set<number>>,
    sites: Site[],
): Map<string, VillageIrsFormData> {
    const siteById = new Map(sites.map(site => [site.siteId, site]));
    const formData = new Map<string, VillageIrsFormData>();

    for (const [monthKey, siteIdSet] of selectedSites) {
        const villages = new Set<string>();
        for (const siteId of siteIdSet) {
            const villageName = siteById.get(siteId)?.villageName;
            if (villageName) villages.add(villageName);
        }
        for (const villageName of villages) {
            formData.set(`${monthKey}:${villageName}`, {
                monthKey,
                villageName,
                wasIrsSprayed: false,
                insecticideSprayed: '',
                dateLastSprayed: '',
            });
        }
    }

    return formData;
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
    const [formData, setFormData] = useState<Map<string, VillageIrsFormData>>(
        () => initFormData(selectedSites, sites),
    );

    useEffect(() => {
        if (!isOpen) return;
        setStep(1);
        setFormData(initFormData(selectedSites, sites));
    }, [isOpen, selectedSites, sites]);

    const monthKeys = useMemo(
        () => [...selectedSites.keys()].sort(),
        [selectedSites],
    );

    function updateEntry(key: string, patch: Partial<VillageIrsFormData>) {
        setFormData(prev => {
            const next = new Map(prev);
            const current = next.get(key);
            if (current) next.set(key, { ...current, ...patch });
            return next;
        });
    }

    function isFormValid(): boolean {
        for (const entry of formData.values()) {
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
            onOpenChange={isOpen => {
                onOpenChange(isOpen);
                if (!isOpen) setStep(1);
            }}
        >
            <DialogContent showCloseButton={false} className="max-w-2xl">
                {step === 1 ? (
                    <Fragment>
                        <DialogHeader>
                            <DialogTitle>IRS Information</DialogTitle>
                            <DialogDescription>
                                For each village, indicate whether Indoor
                                Residual Spraying (IRS) was conducted. If yes,
                                provide the insecticide and date. This applies
                                to all sites in that village.
                            </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-6">
                                {monthKeys.map(monthKey => {
                                    const entries = [
                                        ...formData.values(),
                                    ].filter(
                                        entry => entry.monthKey === monthKey,
                                    );
                                    if (entries.length === 0) return null;
                                    const [y, m] = monthKey.split('-');
                                    const monthLabel = format(
                                        new Date(Number(y), Number(m) - 1, 1),
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
                                            {entries.map(entry => {
                                                const key = `${monthKey}:${entry.villageName}`;
                                                return (
                                                    <SiteIrsRow
                                                        key={key}
                                                        entry={entry}
                                                        formKey={key}
                                                        onUpdate={updateEntry}
                                                    />
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
                                your laptop during the export.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() =>
                                    onConfirm([...formData.values()])
                                }
                            >
                                Start export
                            </Button>
                        </DialogFooter>
                    </Fragment>
                )}
            </DialogContent>
        </Dialog>
    );
}
