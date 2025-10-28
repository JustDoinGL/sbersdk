import { useToast } from "@sg/uikit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PatchSalesPointDto } from "@/5_shared/api";
import { SalesPointParamsDto, salesPointQueryOptions } from "./query_options";

export function useUpdateSalesPoint(id: string) {
    const queryClient = useQueryClient();
    const { push } = useToast();

    const { mutate, isPending, data } = useMutation({
        mutationFn: (salesPoint: Partial<PatchSalesPointDto>) => 
            api.sales_point.patchSalesPointById(id, salesPoint),
        async onSuccess() {
            await queryClient.invalidateQueries({
                queryKey: [salesPointQueryOptions.baseKey, "point", id],
            });
        },
        onError(error: Error) {
            console.error(error);
            push({ type: "error", title: "Ошибка при обновлении точки продаж" });
        },
    });

    const handleUpdateSalesPoint = (
        salesPoint: Partial<PatchSalesPointDto>,
        options?: {
            onSuccess?: (data: SalesPointParamsDto) => void;
        }
    ) => {
        mutate(salesPoint, {
            onSuccess: options?.onSuccess,
        });
    };

    return {
        handleUpdateSalesPoint,
        isPendingDeal: isPending,
        dataDeal: data,
    };
}