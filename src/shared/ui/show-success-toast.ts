import { toast } from 'sonner';

export function showSuccessToast(
  message: string = 'Operation completed successfully.',
) {
  toast.success(message);
}
