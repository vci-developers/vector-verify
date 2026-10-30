'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import type { SpecimenChangelog } from '@/features/review/specimens-table/validation/specimen-changelog-schema';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { ArrowRight, Pencil, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSpecimenPredictionLabel } from '../hooks/use-specimen-prediction-label';

interface SpecimenChangelogDrawerProps {
    changelog: SpecimenChangelog;
    siteDisplayName: string;
}

export default function SpecimenChangelogDrawer({
    changelog,
    siteDisplayName,
}: SpecimenChangelogDrawerProps) {
    const t = useTranslations('SpecimenChangelog');
    const tCommon = useTranslations('Common');
    const getPredictionLabel = useSpecimenPredictionLabel();
    const editsNewestFirst = [...changelog.edits].sort(
        (first, second) =>
            second.createdAt - first.createdAt || second.id - first.id,
    );

    if (editsNewestFirst.length === 0) {
        return (
            <span>
                <span aria-hidden="true">—</span>
                <span className="sr-only">{t('noChanges')}</span>
            </span>
        );
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t('openChanges', {
                        specimenId: changelog.specimenId,
                        count: editsNewestFirst.length,
                    })}
                >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    {editsNewestFirst.length}
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                showCloseButton={false}
                className="w-full gap-0 sm:max-w-xl"
            >
                <SheetHeader className="border-b pr-16">
                    <SheetTitle>
                        {t('title', { specimenId: changelog.specimenId })}
                    </SheetTitle>
                    <SheetDescription>
                        {t('context', {
                            sessionId: changelog.sessionId,
                            siteDisplayName,
                        })}
                    </SheetDescription>
                </SheetHeader>
                <SheetClose asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="absolute top-3 right-3"
                        aria-label={tCommon('close')}
                    >
                        <X className="size-4" aria-hidden="true" />
                    </Button>
                </SheetClose>
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
                    <div className="space-y-1">
                        <h2 className="text-sm font-semibold">
                            {t('predictionChanges', {
                                count: editsNewestFirst.length,
                            })}
                        </h2>
                        <p className="text-muted-foreground text-xs">
                            {t('timezone', { timezone: changelog.timezone })}
                        </p>
                    </div>
                    <ol className="space-y-6">
                        {editsNewestFirst.map(edit => (
                            <li key={edit.id} className="space-y-3">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium">
                                        {edit.reviewerName ??
                                            t('unknownReviewer')}
                                    </h3>
                                    <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
                                        <time
                                            dateTime={new Date(
                                                edit.createdAt,
                                            ).toISOString()}
                                        >
                                            {formatDateInTimezone(
                                                edit.createdAt,
                                                changelog.timezone,
                                                'MMM d, yyyy, h:mm a',
                                            )}
                                        </time>
                                        <span aria-hidden="true">·</span>
                                        <span>
                                            {edit.imageNumber !== null
                                                ? t('image', {
                                                      number: edit.imageNumber,
                                                  })
                                                : edit.imageId !== undefined
                                                  ? t('imageId', {
                                                        id: edit.imageId,
                                                    })
                                                  : t('unknownImage')}
                                        </span>
                                    </p>
                                </div>
                                {edit.changes.length === 0 && (
                                    <p className="text-muted-foreground text-sm">
                                        {t('unavailableChanges')}
                                    </p>
                                )}
                                <dl className="space-y-2 rounded-md border p-3 text-sm">
                                    {edit.changes.map(change => (
                                        <div
                                            key={change.field}
                                            className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-3"
                                        >
                                            <dt className="text-muted-foreground">
                                                {t(change.field)}
                                            </dt>
                                            <dd className="flex flex-wrap items-center gap-2">
                                                <span className="break-words">
                                                    {getPredictionLabel(
                                                        change.field,
                                                        change.previousValue,
                                                    )}
                                                </span>
                                                <ArrowRight
                                                    className="text-muted-foreground size-3.5 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                <span className="sr-only">
                                                    {t('changedTo')}
                                                </span>
                                                <span className="font-medium break-words">
                                                    {getPredictionLabel(
                                                        change.field,
                                                        change.value,
                                                    )}
                                                </span>
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </li>
                        ))}
                    </ol>
                </div>
            </SheetContent>
        </Sheet>
    );
}
