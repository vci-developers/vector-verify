import { toast } from 'sonner';
import type { Result } from '../result/result';
import { networkErrorMessage, type NetworkError } from './network-error';

export function toastResult<T>(
    result: Result<T, NetworkError>,
    messages: { success?: string; error: string },
): Result<T, NetworkError> {
    if (result.ok) {
        if (messages.success) toast.success(messages.success);
        return result;
    }

    toast.error(messages.error, {
        description: networkErrorMessage(result.error),
    });
    return result;
}
