import { useQuery } from '@tanstack/react-query';
import { useQueryGetContractLoss } from "@/4_entities/deal/api";
import { useQueryGetDeal } from "@/4_entities/deal/api/useQueryGetDeal";
import { DealDto } from "@/5_shared/api";
import { GetDealsProps } from "@/5_shared/api/endpoints/deal_methods";

interface TContractLoss {
  // добавьте поля из ответа getContractLoss
}

interface THelper extends DealDto, TContractLoss {}

export const useProlongationDeals = (params: GetDealsProps) => {
  // Получаем сделки
  const { data: dealData, isLoading: dealsLoading, error: dealsError } = useQueryGetDeal(params);

  // Извлекаем GUID пролонгационных контрактов
  const prolongationDeals = dealData?.results?.filter((el: DealDto) => el.prolongation) || [];
  const prolongationGuids = prolongationDeals.map((el: DealDto) => el.prolongation_contract_guid);

  // Используем useQueries для параллельных запросов
  const contractLossQueries = useQueries({
    queries: prolongationGuids.map((guid) => ({
      queryKey: ['contractLoss', guid],
      queryFn: () => api.dwh.getContractLoss({ guid }),
      enabled: !!guid && prolongationGuids.length > 0,
    })),
  });

  // Объединяем данные
  const enrichedResults = prolongationDeals.map((deal: DealDto, index: number) => {
    const contractLossData = contractLossQueries[index]?.data;
    return {
      ...deal,
      ...contractLossData,
    } as THelper;
  });

  const isLoading = dealsLoading || contractLossQueries.some(query => query.isLoading);
  const errors = [
    dealsError,
    ...contractLossQueries.map(query => query.error)
  ].filter(Boolean);

  return {
    data: {
      count: enrichedResults.length,
      next: dealData?.next || 0,
      previous: dealData?.previous || 0,
      results: enrichedResults,
    },
    isLoading,
    error: errors.length > 0 ? errors : null,
  };
};