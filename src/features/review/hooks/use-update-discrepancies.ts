'use client';

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { updateDiscrepancies } from "../api/update-discrepancies";
import { reviewKeys } from "../api/review-keys";
import type {
    DiscrepancyUpdateRequestDto,
    DiscrepancyUpdateResponseDto
} from "@/features/review/types";

export function useUpdateDiscrepanciesMutation(
    options?: Omit<
    UseMutationOptions<
        DiscrepancyUpdateResponseDto,
        Error,
        { payload: DiscrepancyUpdateRequestDto },
        unknown
    >,
    'mutationFn' | 'onSuccess'
    > & {
        onSuccess?: (data: DiscrepancyUpdateResponseDto) => void;
    },
) {
    const queryClient = useQueryClient();
    
    return useMutation<
        DiscrepancyUpdateResponseDto,
        Error,
        { payload: DiscrepancyUpdateRequestDto }
    >({
        mutationFn: ({ payload }) => 
            updateDiscrepancies(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ 
                queryKey: reviewKeys.root 
            });
            
            if (options?.onSuccess) {
                options.onSuccess(data);
            }
        },
        onError: options?.onError,
    });
}