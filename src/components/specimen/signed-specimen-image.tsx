'use client';

import { useSignedResourceUrl } from '@/api/resources/hooks/use-signed-resource-url';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

export type ImageLoadStatus = 'pending' | 'loaded' | 'error';

interface SignedSpecimenImageProps {
    path: string;
    alt: string;
    sizes?: string;
    className?: string;
    fill?: boolean;
    style?: React.CSSProperties;
    onLoadStatusChange?: (path: string, status: ImageLoadStatus) => void;
}

export default function SignedSpecimenImage({
    path,
    alt,
    sizes,
    className,
    fill,
    style,
    onLoadStatusChange,
}: SignedSpecimenImageProps) {
    const {
        data: signedResourceUrlResult,
        isPending: isSignedResourceUrlResultPending,
        isFetching,
        isError,
        refetch: refetchSignedResourceUrl,
    } = useSignedResourceUrl(path);
    const [hasRetried, setHasRetried] = useState(false);
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);

    const signedResource = signedResourceUrlResult?.ok
        ? signedResourceUrlResult.data
        : null;
    const isUrlLive =
        signedResource != null && Date.now() < signedResource.expiresAt * 1000;

    const loadFailed =
        signedResource !== null && failedUrl === signedResource.url;
    const isImageLoaded =
        signedResource !== null && loadedUrl === signedResource.url;
    const loadStatus: ImageLoadStatus =
        isError ||
        (signedResourceUrlResult && !signedResourceUrlResult.ok) ||
        loadFailed
            ? 'error'
            : !isUrlLive || isRetrying || isFetching || !isImageLoaded
              ? 'pending'
              : 'loaded';

    useEffect(() => {
        onLoadStatusChange?.(path, loadStatus);
    }, [path, loadStatus, onLoadStatusChange]);

    async function handleLoadError() {
        if (hasRetried) {
            setFailedUrl(signedResource?.url ?? null);
            return;
        }
        setHasRetried(true);
        setLoadedUrl(null);
        setIsRetrying(true);
        await refetchSignedResourceUrl();
        setIsRetrying(false);
    }

    if (
        isError ||
        (signedResourceUrlResult && !signedResourceUrlResult.ok) ||
        loadFailed
    ) {
        return (
            <div className="bg-muted text-muted-foreground absolute inset-0 flex items-center justify-center">
                <p className="px-2 text-center text-sm">Image unavailable</p>
            </div>
        );
    }

    if (
        !signedResourceUrlResult ||
        isSignedResourceUrlResultPending ||
        isRetrying
    ) {
        return <Skeleton rounded="none" className="absolute inset-0" />;
    }

    if (!isUrlLive) {
        return <Skeleton rounded="none" className="absolute inset-0" />;
    }

    return (
        <React.Fragment>
            {!isImageLoaded && (
                <div className="bg-accent absolute inset-0 flex items-center justify-center">
                    <Spinner className="size-10" />
                </div>
            )}
            <Image
                src={signedResource.url}
                alt={alt}
                fill={fill}
                sizes={sizes}
                className={className}
                style={style}
                onError={handleLoadError}
                onLoad={() => setLoadedUrl(signedResource.url)}
                loading={onLoadStatusChange ? 'eager' : undefined}
                draggable={false}
            />
        </React.Fragment>
    );
}
