import { userToast } from "@sg/uikit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PatchSalesPointDto, SalesPointDto } from "@/5_shared/api";
import { salesPointQueryOptions } from "./query_options";

export function useUpdateSalesPoint() {
    const { push } = userToast();
    const queryClient = useQueryClient();

    const { mutate, isPending, data } = useMutation({
        mutationFn: async ({ 
            id,
            salesPoint,
        }: {
            id: string;
            salesPoint: Partial<PatchSalesPointDto>;
        }) => await api.sales_point.patchSalesPointById(id, salesPoint),
        onError: (error: Error) => {
            console.error(error);
            push({ type: "error", title: "Ошибка при обновлении точки продаж" });
        },
        onSuccess: (data: SalesPointDto, variables) => {
            // Инвалидируем кэш для обновления данных
            queryClient.invalidateQueries({ 
                queryKey: [...salesPointQueryOptions.baseKey, "point", variables.id] 
            });
            
            // Или альтернативно обновляем данные напрямую:
            // queryClient.setQueryData(
            //     [...salesPointQueryOptions.baseKey, "point", variables.id],
            //     data
            // );
        }
    });

    const handleUpdateSalesPoint = (
        id: string,
        salesPoint: Partial<PatchSalesPointDto>,
        options?: {
            onSuccess?: (data: SalesPointDto) => void;
        }
    ) => {
        mutate(
            { id, salesPoint },
            {
                onSuccess: (data) => {
                    options?.onSuccess?.(data);
                },
            }
        );
    };

    return {
        handleUpdateSalesPoint,
        isPending,
        data,
    };
}