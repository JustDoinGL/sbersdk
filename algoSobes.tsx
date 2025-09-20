import { useQuery } from '@tanstack/react-query';

// Типы (добавьте в соответствии с вашей структурой)
interface TDeal {
  prolongation: boolean;
  prolongation_contract_guid: string;
  // другие поля сделки
}

interface TContractLoss {
  // поля из getContractLoss
}

interface THelper extends TDeal, TContractLoss {}

// Хук для получения сделок
const useGetDeals = (params: {
  client?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
  filters?: any;
}) => {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: () => api.deal_methods.getDeals(params),
  });
};

// Хук для получения потерь контракта
const useGetContractLoss = (guid: string) => {
  return useQuery({
    queryKey: ['contractLoss', guid],
    queryFn: () => api.dwh.getContractLoss({ guid }),
    enabled: !!guid, // Запрос выполняется только если guid существует
  });
};

// Основной хук для объединенных данных
const useProlongationDeals = (params: {
  client?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
  filters?: any;
}) => {
  const {
    data: dealsData,
    isLoading: dealsLoading,
    error: dealsError,
  } = useGetDeals(params);

  // Получаем GUID пролонгационных контрактов
  const prolongationGuids = dealsData?.results
    ?.filter((el: TDeal) => el.prolongation)
    .map((el: TDeal) => el.prolongation_contract_guid) || [];

  // Запросы для каждого контракта
  const contractLossQueries = prolongationGuids.map(guid => 
    useGetContractLoss(guid)
  );

  // Объединяем данные
  const enrichedResults = dealsData?.results
    ?.filter((el: TDeal) => el.prolongation)
    .map((deal: TDeal, index: number) => {
      const contractLossData = contractLossQueries[index]?.data;
      return {
        ...deal,
        ...contractLossData,
      } as THelper;
    }) || [];

  const isLoading = dealsLoading || contractLossQueries.some(query => query.isLoading);
  const errors = [
    dealsError,
    ...contractLossQueries.map(query => query.error)
  ].filter(Boolean);

  return {
    data: {
      count: enrichedResults.length,
      next: dealsData?.next || 0,
      previous: dealsData?.previous || 0,
      results: enrichedResults,
    },
    isLoading,
    error: errors.length > 0 ? errors : null,
  };
};

// Использование в компоненте
const MyComponent = () => {
  const { data, isLoading, error } = useProlongationDeals({
    client: 'some-client',
    page: 1,
    page_size: 10,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {JSON.stringify(error)}</div>;

  return (
    <div>
      {/* Рендеринг данных */}
    </div>
  );
};