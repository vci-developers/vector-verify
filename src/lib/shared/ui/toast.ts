import { toast } from 'sonner';
import { HttpError } from '@/lib/shared/http/core/http-error';

export function showErrorToast(
  error: unknown,
  fallback = 'Something went wrong.',
) {
  if (error instanceof HttpError) {
    if (error.isUnauthorized) {
      toast.error('Your session has expired. Please sign in again.');
      return;
    }
    toast.error(error.message || fallback);
    return;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : fallback;

  toast.error(message);
}
