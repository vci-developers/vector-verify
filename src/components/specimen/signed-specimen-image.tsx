'use client';

import { useSignedResourceUrl } from '@/api/resources/hooks/use-signed-resource-url';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useState } from 'react';

interface SignedSpecimenImageProps {
    path: string;
    alt: string;
    sizes?: string;
    className?: string;
    fill?: boolean;
}

export default function SignedSpecimenImage({
    path,
    alt,
    sizes,
    className,
    fill,
}: SignedSpecimenImageProps) {
    const {
        data: signedResourceUrlResult,
        isPending: isSignedResourceUrlResultPending,
        refetch: refetchSignedResourceUrl,
    } = useSignedResourceUrl(path);
    const [hasRetried, setHasRetried] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);

    const signedResource = signedResourceUrlResult?.ok
        ? signedResourceUrlResult.data
        : null;
    const isUrlLive =
        signedResource != null && Date.now() < signedResource.expiresAt * 1000;

    function handleLoadError() {
        if (hasRetried) {
            setLoadFailed(true);
            return;
        }
        setHasRetried(true);
        refetchSignedResourceUrl();
    }

    if (!signedResourceUrlResult || isSignedResourceUrlResultPending) {
        return <Skeleton rounded="none" className="absolute inset-0" />;
    }

    if (!signedResourceUrlResult.ok || loadFailed) {
        return (
            <div className="bg-muted text-muted-foreground absolute inset-0 flex items-center justify-center">
                <p className="text-sm">Image unavailable</p>
            </div>
        );
    }

    if (!isUrlLive) {
        return <Skeleton rounded="none" className="absolute inset-0" />;
    }

    return (
        <Image
            src={signedResource.url}
            alt={alt}
            fill={fill}
            unoptimized
            sizes={sizes}
            className={className}
            onError={handleLoadError}
        />
    );
}
