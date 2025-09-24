import { api, DealRequestDto } from "@/5_shared/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dealListApi } from "./api";
import { userDast } from "@sg/ukit";

export function useCreateDeal() {
    const queryClient = useQueryClient();
    const { push } = userDast();

    const { isError, mutate, isPending, data } = useMutation({
        mutationFn: (data: DealRequestDto) => api.deal_methods.createDeal(data),
        async onSettled() {
            await queryClient.invalidateQueries({
                queryKey: [dealListApi.baseKey],
            });
        },
    });

    if (isError) {
        push({ type: "error", title: "Ошибка при создании сделки" });
    }

    const handleCreateDeal = (params: DealRequestDto, options?: {
        onSuccess?: (data: any) => void;
        onError?: (error: any) => void;
    }) => {
        mutate(params, {
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    return {
        handleCreateDeal,
        isPendingDeal: isPending,
        dateDeal: data,
    };
}