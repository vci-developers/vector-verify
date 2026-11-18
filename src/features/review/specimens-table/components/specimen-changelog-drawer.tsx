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
import type { SpecimenChangelog } from '@/features/review/specimens-table/types/specimen-changelog';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { ArrowRight, Microscope, Pencil, Tag, X } from 'lucide-react';
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
    const groups = [
        {
            scope: 'specimen' as const,
            label: 'specimenId',
            Icon: Tag,
            edits: editsNewestFirst.filter(edit => edit.scope === 'specimen'),
        },
        {
            scope: 'image' as const,
            label: 'predictions',
            Icon: Microscope,
            edits: editsNewestFirst.filter(edit => edit.scope === 'image'),
        },
    ].filter(group => group.edits.length > 0);

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
                            {t('reviewChanges', {
                                count: editsNewestFirst.length,
                            })}
                        </h2>
                        <p className="text-muted-foreground text-xs">
                            {t('timezone', { timezone: changelog.timezone })}
                        </p>
                    </div>
                    <div className="space-y-8">
                        {groups.map(({ scope, label, Icon, edits }) => (
                            <section
                                key={scope}
                                aria-labelledby={`${scope}-heading`}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon
                                        className="text-primary size-5"
                                        aria-hidden="true"
                                    />
                                    <h3
                                        id={`${scope}-heading`}
                                        className="text-base font-semibold"
                                    >
                                        {t(label)}
                                    </h3>
                                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                                        {edits.length}
                                    </span>
                                </div>
                                <ol className="ml-2 space-y-6 border-l pl-5">
                                    {edits.map(edit => (
                                        <li
                                            key={edit.id}
                                            className="relative space-y-3"
                                        >
                                            <span
                                                className="bg-background absolute top-1.5 -left-[1.61rem] size-3 rounded-full border-2"
                                                aria-hidden="true"
                                            />
                                            <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
                                                <span className="text-foreground font-medium">
                                                    {edit.reviewerName ??
                                                        t('unknownReviewer')}
                                                </span>
                                                <span aria-hidden="true">
                                                    ·
                                                </span>
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
                                                {edit.scope === 'image' && (
                                                    <>
                                                        <span aria-hidden="true">
                                                            ·
                                                        </span>
                                                        <span>
                                                            {edit.imageNumber !==
                                                            null
                                                                ? t('image', {
                                                                      number: edit.imageNumber,
                                                                  })
                                                                : edit.imageId !==
                                                                    undefined
                                                                  ? t(
                                                                        'imageId',
                                                                        {
                                                                            id: edit.imageId,
                                                                        },
                                                                    )
                                                                  : t(
                                                                        'unknownImage',
                                                                    )}
                                                        </span>
                                                    </>
                                                )}
                                            </p>
                                            {edit.changes.length === 0 ? (
                                                <p className="text-muted-foreground text-sm">
                                                    {t('unavailableChanges')}
                                                </p>
                                            ) : (
                                                <dl className="space-y-2 text-sm">
                                                    {edit.changes.map(
                                                        change => (
                                                            <div
                                                                key={
                                                                    change.field
                                                                }
                                                                className={
                                                                    scope ===
                                                                    'image'
                                                                        ? 'grid gap-1 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-3'
                                                                        : ''
                                                                }
                                                            >
                                                                {scope ===
                                                                'image' ? (
                                                                    <dt className="text-muted-foreground">
                                                                        {t(
                                                                            change.field,
                                                                        )}
                                                                    </dt>
                                                                ) : (
                                                                    <dt className="sr-only">
                                                                        {t(
                                                                            'specimenId',
                                                                        )}
                                                                    </dt>
                                                                )}
                                                                <dd className="flex min-w-0 flex-wrap items-center gap-2">
                                                                    <span className="bg-destructive/10 text-destructive min-w-0 rounded-md px-2 py-1 break-words line-through">
                                                                        {change.field ===
                                                                        'specimenId'
                                                                            ? change.previousValue
                                                                            : getPredictionLabel(
                                                                                  change.field,
                                                                                  change.previousValue,
                                                                              )}
                                                                    </span>
                                                                    <ArrowRight
                                                                        className="text-muted-foreground size-3.5 shrink-0"
                                                                        aria-hidden="true"
                                                                    />
                                                                    <span className="sr-only">
                                                                        {t(
                                                                            'changedTo',
                                                                        )}
                                                                    </span>
                                                                    <span className="min-w-0 rounded-md bg-green-50 px-2 py-1 font-medium break-words text-green-800 dark:bg-green-950 dark:text-green-300">
                                                                        {change.field ===
                                                                        'specimenId'
                                                                            ? change.value
                                                                            : getPredictionLabel(
                                                                                  change.field,
                                                                                  change.value,
                                                                              )}
                                                                    </span>
                                                                </dd>
                                                            </div>
                                                        ),
                                                    )}
                                                </dl>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
