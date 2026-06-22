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
import { Fragment, useEffect, useState } from 'react';
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
import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import { formatCollectionCycleLabel } from '../../sites-list/utils/format-collection-cycle-label';
import { useTranslations } from 'next-intl';
import Dhis2DryRunPreviewItem from './dhis2-dry-run-preview-item';
import { usePostDhis2SyncDryRun } from '@/api/dhis2/hooks/use-post-dhis2-sync-dry-run';
import type { Dhis2SyncSiteResultStatus } from '@/api/dhis2/validation/dhis2-sync-result-schema';
import { networkErrorMessage } from '@/lib/network/network-error';

interface Dhis2IrsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    submissions: { site: Site; collectionCycle: CollectionCycle }[];
    onConfirmSubmission: (irsData: SiteIrsData[]) => void;
}

export default function Dhis2IrsDialog({
    open,
    onOpenChange,
    submissions,
    onConfirmSubmission,
}: Dhis2IrsDialogProps) {
    const t = useTranslations('CollectionCycle');
    const irsForm = useForm<Dhis2IrsFormInput>({
        resolver: zodResolver(dhis2IrsFormSchema),
        defaultValues: {
            sitesIrsData: submissions.map(({ site }) => ({
                siteId: site.siteId,
                wasIrsSprayed: false,
            })),
        },
    });

    const { mutateAsync: runDhis2SyncDryRun } = usePostDhis2SyncDryRun();
    const [validationPreviewByIndex, setValidationPreviewByIndex] = useState<
        Map<number, { status: Dhis2SyncSiteResultStatus; message?: string }>
    >(new Map());
    const [isValidatingSubmissions, setIsValidatingSubmissions] =
        useState(false);

    useEffect(() => {
        if (open) {
            irsForm.reset({
                sitesIrsData: submissions.map(({ site }) => ({
                    siteId: site.siteId,
                    wasIrsSprayed: false,
                })),
            });
            setValidationPreviewByIndex(new Map());
            setIsValidatingSubmissions(false);
        }
    }, [open, submissions, irsForm]);

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

    async function handleValidateSubmissions() {
        const { sitesIrsData } = irsForm.getValues();
        setValidationPreviewByIndex(new Map());
        setIsValidatingSubmissions(true);

        const outcomes = await Promise.allSettled(
            submissions.map(({ site, collectionCycle }, index) =>
                runDhis2SyncDryRun({
                    queryParams: {
                        collectionCycleId: collectionCycle.id,
                        siteId: site.siteId,
                        dryRun: true,
                    },
                    requestBody: {
                        irsData: [
                            sitesIrsData[index] ?? { siteId: site.siteId },
                        ],
                    },
                }),
            ),
        );

        setValidationPreviewByIndex(
            new Map(
                outcomes.map((outcome, index) => {
                    if (outcome.status === 'rejected') {
                        return [
                            index,
                            {
                                status: 'failed',
                                message:
                                    'Could not reach DHIS2 to validate this submission.',
                            },
                        ];
                    }

                    const result = outcome.value;
                    if (!result.ok) {
                        return [
                            index,
                            {
                                status: 'failed',
                                message: networkErrorMessage(result.error),
                            },
                        ];
                    }

                    const siteResult = result.data.results?.[0];
                    return [
                        index,
                        {
                            status:
                                siteResult?.status ??
                                (result.data.success ? 'success' : 'failed'),
                            message: siteResult?.message,
                        },
                    ];
                }),
            ),
        );
        setIsValidatingSubmissions(false);
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
                        {submissions.length === 1
                            ? 'this submission'
                            : `these ${submissions.length} submissions`}{' '}
                        before submitting to DHIS2.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="dhis2-irs-rhf"
                    onSubmit={irsForm.handleSubmit(handleConfirmSubmission)}
                    className="space-y-4"
                >
                    <FieldGroup className="max-h-[60vh] gap-4 overflow-y-auto">
                        {submissions.map(({ site, collectionCycle }, index) => {
                            const wasIrsSprayed = irsForm.watch(
                                `sitesIrsData.${index}.wasIrsSprayed`,
                            );
                            const validationPreview =
                                validationPreviewByIndex.get(index);
                            return (
                                <div
                                    key={`${collectionCycle.id}:${site.siteId}`}
                                    className="space-y-3 rounded-md border p-3"
                                >
                                    <div>
                                        <p className="text-foreground text-sm font-medium">
                                            {
                                                getSiteLabelParts(site)
                                                    .primaryLabel
                                            }
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {formatCollectionCycleLabel(
                                                collectionCycle,
                                                t,
                                            )}
                                        </p>
                                    </div>

                                    <Controller
                                        name={`sitesIrsData.${index}.wasIrsSprayed`}
                                        control={irsForm.control}
                                        render={({ field }) => (
                                            <Field orientation="horizontal">
                                                <Checkbox
                                                    id={`irs-${collectionCycle.id}-${site.siteId}-sprayed`}
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
                                                    htmlFor={`irs-${collectionCycle.id}-${site.siteId}-sprayed`}
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
                                                            htmlFor={`irs-${collectionCycle.id}-${site.siteId}-insecticide`}
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
                                                                id={`irs-${collectionCycle.id}-${site.siteId}-insecticide`}
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
                                                            htmlFor={`irs-${collectionCycle.id}-${site.siteId}-date`}
                                                        >
                                                            Date last sprayed
                                                        </FieldLabel>
                                                        <Input
                                                            {...field}
                                                            value={
                                                                field.value ??
                                                                ''
                                                            }
                                                            id={`irs-${collectionCycle.id}-${site.siteId}-date`}
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

                                    {(isValidatingSubmissions ||
                                        validationPreview) && (
                                        <div className="border-t pt-3">
                                            <Dhis2DryRunPreviewItem
                                                isValidating={
                                                    isValidatingSubmissions
                                                }
                                                status={
                                                    validationPreview?.status
                                                }
                                                message={
                                                    validationPreview?.message
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </FieldGroup>

                    {validationPreviewByIndex.size > 0 && (
                        <p className="text-muted-foreground text-xs">
                            This preview runs an early check on your data —
                            without submitting anything — to catch major
                            problems like missing information or values in the
                            wrong format. It doesn&apos;t run every check DHIS2
                            performs on a real submission, so a successful
                            preview doesn&apos;t guarantee the final submission
                            will complete.
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleValidateSubmissions}
                            disabled={isValidatingSubmissions}
                        >
                            Validate
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
