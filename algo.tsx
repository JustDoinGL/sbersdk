import { api, DealDto, DealRequestDto } from "@/5_shared/api";
import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { dealListApi } from "./api";
import { useToast } from "@sg/uikit";

interface UseCreateDealOptions {
    onSuccess?: (data: DealDto) => void;
    onError?: (error: Error) => void;
}

interface UseCreateDealReturn {
    handleCreateDeal: (params: DealRequestDto, options?: UseCreateDealOptions) => void;
    isPendingDeal: boolean;
    dataDeal: DealDto | undefined;
    mutation: UseMutationResult<DealDto, Error, DealRequestDto>;
}

export function useCreateDeal(): UseCreateDealReturn {
    const queryClient = useQueryClient();
    const { push } = useToast();

    const mutation = useMutation({
        mutationFn: (data: DealRequestDto) => api.deal_methods.createDeal(data),
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: [dealListApi.baseKey],
            });
        },
        onError: (error: Error) => {
            console.error(error);
            push({ type: "error", title: "Ошибка при создании сделки" });
        },
    });

    const handleCreateDeal = (
        params: DealRequestDto, 
        options?: UseCreateDealOptions
    ) => {
        mutation.mutate(params, {
            onSuccess: (data) => {
                options?.onSuccess?.(data);
            },
            onError: (error) => {
                options?.onError?.(error);
            },
        });
    };

    return {
        handleCreateDeal,
        isPendingDeal: mutation.isPending,
        dataDeal: mutation.data,
        mutation,
    };
}