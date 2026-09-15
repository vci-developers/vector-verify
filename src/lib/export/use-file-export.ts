import { triggerFileDownload } from '@/lib/download/trigger-file-download';
import {
    networkErrorMessage,
    type NetworkError,
} from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useState } from 'react';

export function useFileExport() {
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function exportFile(url: string, filename: string): Promise<boolean> {
        setIsExporting(true);
        setError(null);

        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const result: Result<never, NetworkError> =
                    await response.json();
                setError(
                    result.ok
                        ? 'An unexpected error occurred. Please try again.'
                        : networkErrorMessage(result.error),
                );
                return false;
            }

            await triggerFileDownload(response, filename);
            return true;
        } catch {
            setError('An unexpected error occurred. Please try again.');
            return false;
        } finally {
            setIsExporting(false);
        }
    }

    return { isExporting, error, exportFile };
}
