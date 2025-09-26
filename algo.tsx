import { api, DealDto, DealRequestDto } from "@/5_shared/api";
import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { dealListApi } from "./api";
import { useToast } from "@sg/uikit";
import { useCallback } from "react";

interface UseCreateDealOptions {
  onSuccess?: (data: DealDto, variables: DealRequestDto) => void;
  onError?: (error: Error, variables: DealRequestDto) => void;
  onSettled?: (data: DealDto | undefined, error: Error | null, variables: DealRequestDto) => void;
  invalidateQueries?: string[] | false;
  showToast?: boolean;
}

interface UseCreateDealReturn {
  createDeal: (params: DealRequestDto, options?: Partial<UseCreateDealOptions>) => void;
  createDealAsync: (params: DealRequestDto, options?: Partial<UseCreateDealOptions>) => Promise<DealDto>;
  reset: () => void;
  status: {
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: Error | null;
    data: DealDto | undefined;
  };
  mutation: UseMutationResult<DealDto, Error, DealRequestDto>;
}

const DEFAULT_OPTIONS: UseCreateDealOptions = {
  invalidateQueries: [dealListApi.baseKey],
  showToast: true,
};

export function useCreateDeal(defaultOptions?: Partial<UseCreateDealOptions>): UseCreateDealReturn {
  const queryClient = useQueryClient();
  const { push } = useToast();

  const mutation = useMutation({
    mutationFn: (data: DealRequestDto) => api.deal_methods.createDeal(data),
  });

  const createDeal = useCallback((
    params: DealRequestDto, 
    localOptions?: Partial<UseCreateDealOptions>
  ) => {
    const options = { ...DEFAULT_OPTIONS, ...defaultOptions, ...localOptions };

    mutation.mutate(params, {
      onSuccess: async (data, variables) => {
        if (options.invalidateQueries) {
          await queryClient.invalidateQueries({ 
            queryKey: options.invalidateQueries 
          });
        }

        options.onSuccess?.(data, variables);
      },
      onError: (error, variables) => {
        if (options.showToast) {
          push({ 
            type: "error", 
            title: "Ошибка при создании сделки",
            description: error.message 
          });
        }
        options.onError?.(error, variables);
      },
      onSettled: (data, error, variables) => {
        options.onSettled?.(data, error, variables);
      },
    });
  }, [mutation, queryClient, push, defaultOptions]);

  const createDealAsync = useCallback((
    params: DealRequestDto,
    options?: Partial<UseCreateDealOptions>
  ): Promise<DealDto> => {
    return new Promise((resolve, reject) => {
      createDeal(params, {
        ...options,
        onSuccess: (data) => resolve(data),
        onError: (error) => reject(error),
      });
    });
  }, [createDeal]);

  const reset = useCallback(() => {
    mutation.reset();
  }, [mutation]);

  return {
    createDeal,
    createDealAsync,
    reset,
    status: {
      isPending: mutation.isPending,
      isError: mutation.isError,
      isSuccess: mutation.isSuccess,
      error: mutation.error,
      data: mutation.data,
    },
    mutation,
  };
}

// Хелпер для создания хуков с предустановленными настройками
export function useCreateDealWithConfig(config: Partial<UseCreateDealOptions>) {
  return useCreateDeal(config);
}