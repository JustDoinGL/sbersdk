import { useToast } from "@sg/uikit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PatchSalesPointDto, SalesPointDto } from "@/5_shared/api";
import { salesPointQueryOptions } from "./query_options";

export function useUpdateSalesPoint() {
    const queryClient = useQueryClient();
    const { push } = useToast();

    const { mutate, isPending, data } = useMutation({
        mutationFn: ({ id, salesPoint }: { id: string; salesPoint: Partial<PatchSalesPointDto> }) => 
            api.sales_point.patchSalesPointById(id, salesPoint),
        async onSuccess() {
            await queryClient.invalidateQueries({
                queryKey: [salesPointQueryOptions.baseKey, "point"],
            });
        },
        onError(error: Error) {
            console.error(error);
            push({ type: "error", title: "Ошибка при обновлении точки продаж" });
        },
    });

    const handleUpdateSalesPoint = (
        id: string,
        salesPoint: Partial<PatchSalesPointDto>,
        options?: {
            onSuccess?: (data: SalesPointDto, variables: Partial<PatchSalesPointDto>, context: unknown) => void;
        }
    ) => {
        mutate({ id, salesPoint }, {
            onSuccess: options?.onSuccess,
        });
    };

    return {
        handleUpdateSalesPoint,
        isPendingDeal: isPending,
        dataDeal: data,
    };
}