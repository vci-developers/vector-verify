import { triggerFileDownload } from '@/lib/download/trigger-file-download';
import {
    networkErrorMessage,
    type NetworkError,
} from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useState } from 'react';

export function useFileExport(fallbackErrorMessage: string) {
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function exportFile(url: string, filename: string): Promise<boolean> {
        setIsExporting(true);
        setError(null);

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        }).catch((): null => null);

        if (response === null || !response.ok) {
            const errorResult: Result<never, NetworkError> | null = response
                ? await response.json()
                : null;
            setError(
                errorResult && !errorResult.ok
                    ? networkErrorMessage(errorResult.error)
                    : fallbackErrorMessage,
            );
            setIsExporting(false);
            return false;
        }

        await triggerFileDownload(response, filename);
        setIsExporting(false);
        return true;
    }

    return { isExporting, error, exportFile };
}
