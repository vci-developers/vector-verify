import { Download, Link2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { usePostResourcesSign } from '@/api/resources/hooks/use-post-resources-sign';
import { useState } from 'react';
import type { PostResourcesSignSuccessPayload } from '@/api/resources/validation/post-resources-sign-schema';
import { networkErrorMessage } from '@/lib/network/network-error';
import ExpiryCountdown from './expiry-countdown';

interface RawDataExportRowProps {
    title: string;
    description: string;
    path: string;
}

export default function RawDataExportRow({
    title,
    description,
    path,
}: RawDataExportRowProps) {
    const { mutateAsync: signResources, isPending: isPostSignResourcesPending } =
        usePostResourcesSign();
    const [signedLink, setSignedLink] =
        useState<PostResourcesSignSuccessPayload | null>(null);
    const [hasExpired, setHasExpired] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);

    async function handleGenerateLink() {
        setLinkError(null);
        setHasExpired(false);

        const [outcome] = await Promise.allSettled([signResources({ path })]);

        if (outcome.status === 'rejected') {
            setSignedLink(null);
            setLinkError(networkErrorMessage({ kind: 'network' }));
            return;
        }

        if (outcome.value.ok) {
            setSignedLink(outcome.value.data);
        } else {
            setSignedLink(null);
            setLinkError(networkErrorMessage(outcome.value.error));
        }
    }

    function handleExpireLink() {
        setSignedLink(null);
        setHasExpired(true);
    }

    return (
        <div className="border-border rounded-lg border p-3">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-muted-foreground text-xs">
                        {description}
                    </p>
                </div>

                {signedLink ? (
                    <Button asChild variant="outline" size="sm">
                        <a href={signedLink.url}>
                            <Download />
                            Download
                        </a>
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateLink}
                        disabled={isPostSignResourcesPending}
                    >
                        {isPostSignResourcesPending ? (
                            <Loader2 className="animate-spin" />
                        ) : hasExpired ? (
                            <RefreshCw />
                        ) : (
                            <Link2 />
                        )}
                        {isPostSignResourcesPending
                            ? 'Generating…'
                            : hasExpired
                              ? 'Regenerate'
                              : 'Generate link'}
                    </Button>
                )}
            </div>

            {signedLink && (
                <div className="mt-2">
                    <ExpiryCountdown
                        expiresAt={signedLink.expiresAt}
                        onExpire={handleExpireLink}
                    />
                </div>
            )}

            {linkError && (
                <p className="text-destructive mt-2 text-sm">{linkError}</p>
            )}
        </div>
    );
}
