import { QueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router-dom';
import { dealListApi } from './api'; // Импортируйте ваш API
import { DealDto } from './types'; // Импортируйте ваш тип
import { Routes, DealRoutes } from '@5_shared/routes/routes.desktop';

// РЕШЕНИЕ 1: Используйте ensureQueryData (рекомендуется)
const productLoader = (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs): Promise<DealDto> => {
    const { id } = params as { id: string };
    
    // Используйте ensureQueryData - он автоматически проверяет кэш
    return queryClient.ensureQueryData({
      queryKey: ['deal', id],
      queryFn: () => dealListApi.getDealById(id), // Ваша функция запроса
      staleTime: 1000 * 60 * 5, // 5 минут
    });
  };

// РЕШЕНИЕ 2: Если нужен ручной подход с правильной типизацией
const productLoaderAlternative = (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs): Promise<DealDto> => {
    const { id } = params as { id: string };
    
    // Ключ запроса
    const queryKey = ['deal', id];
    
    // Вручную проверяем кэш с правильной типизацией
    const cached = queryClient.getQueryData<DealDto>(queryKey);
    
    if (cached) {
      console.log(`Taking deal ${id} from cache`);
      return cached;
    }
    
    console.log(`Fetching deal ${id} from server`);
    
    // Загружаем с правильной типизацией
    return await queryClient.fetchQuery<DealDto>({
      queryKey,
      queryFn: async () => {
        // Ваша функция загрузки данных
        const response = await dealListApi.getDealById(id);
        return response;
      },
      staleTime: 1000 * 60 * 5,
    });
  };

// РЕШЕНИЕ 3: Самый простой вариант - без TanStack Query
const simpleProductLoader = async ({ params }: LoaderFunctionArgs): Promise<DealDto> => {
  const { id } = params as { id: string };
  
  console.log(`Loading deal ${id}`);
  
  // Прямой запрос без использования TanStack Query
  const response = await fetch(`/api/deals/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch deal');
  }
  
  return await response.json();
};

// Создаем клиент с правильной конфигурацией
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      retry: 2,
    },
  },
});

export const productsRoutes = [
  {
    path: `/${Routes.DEAL}/${DealRoutes.PRODUCTS}`,
    // Выберите один из вариантов:
    // loader: productLoader(queryClient),        // Вариант 1
    // loader: productLoaderAlternative(queryClient), // Вариант 2
    loader: simpleProductLoader,                 // Вариант 3 (рекомендуется)
    Component: Products, // Изменено с component на Component (React Router v6.4+)
  },
];