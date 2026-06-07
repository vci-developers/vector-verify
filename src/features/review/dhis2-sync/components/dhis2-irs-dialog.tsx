'use client';

import {
    irsInsecticideSchema,
    type SiteIrsData,
} from '@/api/dhis2/validation/post-dhis2-sync-task-schema';
import type { Site } from '@/api/site/validation/site-schema';
import { Controller, useForm } from 'react-hook-form';
import {
    type Dhis2IrsFormInput,
    dhis2IrsFormSchema,
} from '../validation/dhis2-irs-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fragment, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { getSiteLabelParts } from '../utils/get-site-label-parts';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Dhis2IrsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sites: Site[];
    onConfirmSubmission: (irsData: SiteIrsData[]) => void;
}

export default function Dhis2IrsDialog({
    open,
    onOpenChange,
    sites,
    onConfirmSubmission,
}: Dhis2IrsDialogProps) {
    const irsForm = useForm<Dhis2IrsFormInput>({
        resolver: zodResolver(dhis2IrsFormSchema),
        defaultValues: {
            sitesIrsData: sites.map(site => ({
                siteId: site.siteId,
                wasIrsSprayed: false,
            })),
        },
    });

    useEffect(() => {
        if (open) {
            irsForm.reset({
                sitesIrsData: sites.map(site => ({
                    siteId: site.siteId,
                    wasIrsSprayed: false,
                })),
            });
        }
    }, [open, sites, irsForm]);

    function handleWasIrsSprayedChange(index: number, wasSprayed: boolean) {
        irsForm.setValue(`sitesIrsData.${index}.wasIrsSprayed`, wasSprayed);
        if (!wasSprayed) {
            irsForm.setValue(
                `sitesIrsData.${index}.insecticideSprayed`,
                undefined,
            );
            irsForm.setValue(
                `sitesIrsData.${index}.dateLastSprayed`,
                undefined,
            );
            irsForm.clearErrors([
                `sitesIrsData.${index}.insecticideSprayed`,
                `sitesIrsData.${index}.dateLastSprayed`,
            ]);
        }
    }

    function handleConfirmSubmission(data: Dhis2IrsFormInput) {
        onConfirmSubmission(data.sitesIrsData);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Indoor residual spraying</DialogTitle>
                    <DialogDescription>
                        Record IRS data for{' '}
                        {sites.length === 1
                            ? 'this site'
                            : `these ${sites.length} sites`}{' '}
                        before submitting to DHIS2.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="dhis2-irs-rhf"
                    onSubmit={irsForm.handleSubmit(handleConfirmSubmission)}
                    className="space-y-4"
                >
                    <FieldGroup className="max-h-[60vh] gap-4 overflow-y-auto">
                        {sites.map((site, index) => {
                            const { primaryLabel } = getSiteLabelParts(site);
                            const wasIrsSprayed = irsForm.watch(
                                `sitesIrsData.${index}.wasIrsSprayed`,
                            );
                            return (
                                <div
                                    key={site.siteId}
                                    className="space-y-3 rounded-md border p-3"
                                >
                                    <p className="text-foreground text-sm font-medium">
                                        {primaryLabel}
                                    </p>

                                    <Controller
                                        name={`sitesIrsData.${index}.wasIrsSprayed`}
                                        control={irsForm.control}
                                        render={({ field }) => (
                                            <Field orientation="horizontal">
                                                <Checkbox
                                                    id={`irs-${site.siteId}-sprayed`}
                                                    checked={
                                                        field.value ?? false
                                                    }
                                                    onCheckedChange={checked =>
                                                        handleWasIrsSprayedChange(
                                                            index,
                                                            checked === true,
                                                        )
                                                    }
                                                />
                                                <FieldLabel
                                                    htmlFor={`irs-${site.siteId}-sprayed`}
                                                >
                                                    Was IRS sprayed?
                                                </FieldLabel>
                                            </Field>
                                        )}
                                    />

                                    {wasIrsSprayed && (
                                        <Fragment>
                                            <Controller
                                                name={`sitesIrsData.${index}.insecticideSprayed`}
                                                control={irsForm.control}
                                                render={({
                                                    field,
                                                    fieldState,
                                                }) => (
                                                    <Field
                                                        data-invalid={
                                                            fieldState.invalid
                                                        }
                                                    >
                                                        <FieldLabel
                                                            htmlFor={`irs-${site.siteId}-insecticide`}
                                                        >
                                                            Insecticide sprayed
                                                        </FieldLabel>
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            value={
                                                                field.value ??
                                                                ''
                                                            }
                                                        >
                                                            <SelectTrigger
                                                                id={`irs-${site.siteId}-insecticide`}
                                                                className="w-full"
                                                            >
                                                                <SelectValue placeholder="Select insecticide..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {irsInsecticideSchema.options.map(
                                                                    insecticide => (
                                                                        <SelectItem
                                                                            key={
                                                                                insecticide
                                                                            }
                                                                            value={
                                                                                insecticide
                                                                            }
                                                                        >
                                                                            {
                                                                                insecticide
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        {fieldState.invalid && (
                                                            <FieldError
                                                                errors={[
                                                                    fieldState.error,
                                                                ]}
                                                            />
                                                        )}
                                                    </Field>
                                                )}
                                            />

                                            <Controller
                                                name={`sitesIrsData.${index}.dateLastSprayed`}
                                                control={irsForm.control}
                                                render={({
                                                    field,
                                                    fieldState,
                                                }) => (
                                                    <Field
                                                        data-invalid={
                                                            fieldState.invalid
                                                        }
                                                    >
                                                        <FieldLabel
                                                            htmlFor={`irs-${site.siteId}-date`}
                                                        >
                                                            Date last sprayed
                                                        </FieldLabel>
                                                        <Input
                                                            {...field}
                                                            value={
                                                                field.value ??
                                                                ''
                                                            }
                                                            id={`irs-${site.siteId}-date`}
                                                            type="date"
                                                        />
                                                        {fieldState.invalid && (
                                                            <FieldError
                                                                errors={[
                                                                    fieldState.error,
                                                                ]}
                                                            />
                                                        )}
                                                    </Field>
                                                )}
                                            />
                                        </Fragment>
                                    )}
                                </div>
                            );
                        })}
                    </FieldGroup>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" form="dhis2-irs-rhf">
                            Submit
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
