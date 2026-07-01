'use client';

import { usePutSessionById } from '@/api/session/hooks/use-put-session-by-id';
import type { Session } from '@/api/session/validation/session-schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { CircleCheck, Lock, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

interface CertificationWorkspaceProps {
    sessions: Session[];
    readOnly: boolean;
    timezone?: string;
    onGoToPreviousStep: () => void;
}

export default function CertificationWorkspace({
    sessions,
    readOnly,
    timezone,
    onGoToPreviousStep,
}: CertificationWorkspaceProps) {
    const t = useTranslations('ReviewCertification');
    const tCommon = useTranslations('Common');
    const router = useRouter();
    const [hasAcknowledged, setHasAcknowledged] = useState(false);
    const [isCertifying, setIsCertifying] = useState(false);

    const { mutateAsync: putSessionByIdAsync } = usePutSessionById();

    const sessionCount = sessions.length;

    const certifier = sessions.find(
        session => session.certifiedBy != null,
    )?.certifiedBy;

    if (readOnly) {
        return (
            <div className="space-y-6">
                <div className="border-primary/30 bg-primary/5 flex items-start gap-3 rounded-lg border p-4">
                    <CircleCheck className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold">
                            {t('summaryTitle')}
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {certifier && certifier.certifiedAt != null
                                ? t('lastCertifiedBy', {
                                      name:
                                          certifier.name ??
                                          t('unknownCertifier'),
                                      date: formatDateInTimezone(
                                          certifier.certifiedAt,
                                          timezone ?? null,
                                          'MMM d, yyyy · h:mm a',
                                      ),
                                  })
                                : t('certifiedFallback', {
                                      count: sessionCount,
                                  })}
                        </p>
                    </div>
                </div>

                <div className="flex justify-start">
                    <Button variant="outline" onClick={onGoToPreviousStep}>
                        {tCommon('previous')}
                    </Button>
                </div>
            </div>
        );
    }

    const canCertify = sessionCount > 0 && hasAcknowledged && !isCertifying;

    async function certifyAllSessions() {
        setIsCertifying(true);
        const outcomes = await Promise.allSettled(
            sessions.map(session =>
                putSessionByIdAsync({
                    sessionId: session.sessionId,
                    requestBody: { state: 'CERTIFIED' },
                }),
            ),
        );
        setIsCertifying(false);

        const failedCount = outcomes.filter(
            outcome => outcome.status !== 'fulfilled' || !outcome.value.ok,
        ).length;

        if (failedCount > 0) {
            toast.error(t('certifyError', { count: failedCount }));
            return;
        }

        toast.success(t('certifySuccess', { count: sessionCount }));
        router.push('/review-next');
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">{t('title')}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    {t('intro', { count: sessionCount })}
                </p>
            </div>

            <div className="border-warning/40 bg-warning/5 rounded-lg border p-4">
                <div className="flex gap-3">
                    <ShieldAlert className="text-warning-foreground mt-0.5 h-5 w-5 shrink-0" />
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-semibold">
                                {t('responsibilityTitle')}
                            </p>
                            <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                                <Lock className="h-3 w-3" />
                                {t('lockedNotice')}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium">
                                {t('confirmListTitle')}
                            </p>
                            <ul className="text-muted-foreground mt-1 list-disc space-y-1 pl-5 text-xs">
                                <li>{t('confirmMetadata')}</li>
                                <li>{t('confirmImages')}</li>
                                <li>{t('confirmAccuracy')}</li>
                            </ul>
                        </div>
                        {certifier && certifier.certifiedAt != null && (
                            <p className="text-warning-foreground text-xs font-medium">
                                {t('overwriteCertifierNotice', {
                                    name:
                                        certifier.name ??
                                        t('unknownCertifier'),
                                    date: formatDateInTimezone(
                                        certifier.certifiedAt,
                                        timezone ?? null,
                                        'MMM d, yyyy',
                                    ),
                                })}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <Checkbox
                    id="certify-confirm"
                    checked={hasAcknowledged}
                    onCheckedChange={checked =>
                        setHasAcknowledged(checked === true)
                    }
                    disabled={isCertifying}
                    className="mt-0.5"
                />
                <Label
                    htmlFor="certify-confirm"
                    className="cursor-pointer text-sm leading-relaxed"
                >
                    {t('acknowledgement')}
                </Label>
            </div>

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={onGoToPreviousStep}
                    disabled={isCertifying}
                >
                    {tCommon('previous')}
                </Button>
                <Button
                    onClick={() => void certifyAllSessions()}
                    disabled={!canCertify}
                >
                    {isCertifying
                        ? t('certifying')
                        : t('certifyButton', { count: sessionCount })}
                </Button>
            </div>
        </div>
    );
}
