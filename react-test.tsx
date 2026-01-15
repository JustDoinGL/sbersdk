import { QueryClient, queryOptions } from '@tanstack/react-query';
import { LoaderFunctionArgs, RouteObject } from 'react-router-dom';
import { dealListApi } from './api'; // Импортируйте ваш API
import { DealDto, DealParamsDTO } from './types'; // Импортируйте типы
import { Routes, DealRoutes } from '@5_shared/routes/routes.desktop';
import Products from './Products'; // Импортируйте компонент

// РЕШЕНИЕ 1: Используйте ensureQueryData (самый простой)
const productLoader = (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs): Promise<DealDto> => {
    const { id } = params as { id: string };
    
    if (!id) {
      throw new Error('Deal ID is required');
    }
    
    // Используем ensureQueryData - он автоматически работает с кэшем
    return await queryClient.ensureQueryData(
      dealListApi.getDealByIdOptions(id)
    );
  };

// РЕШЕНИЕ 2: Ручной подход с правильной типизацией
const productLoaderAlternative = (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs): Promise<DealDto> => {
    const { id } = params as { id: string };
    
    if (!id) {
      throw new Error('Deal ID is required');
    }
    
    // Получаем готовые опции запроса из вашего API
    const options = dealListApi.getDealByIdOptions(id);
    
    // Проверяем кэш - теперь типы совпадают
    const cached = queryClient.getQueryData<DealDto>(options.queryKey);
    
    if (cached) {
      console.log(`Taking deal ${id} from cache`);
      return cached;
    }
    
    console.log(`Fetching deal ${id} from server`);
    
    // fetchQuery принимает options, а не queryOptions
    return await queryClient.fetchQuery<DealDto>(options);
  };

// РЕШЕНИЕ 3: Для нового React Router (с версии 6.4)
const productLoaderV2 = (queryClient: QueryClient) => {
  return async ({ params }: LoaderFunctionArgs) => {
    const { id } = params as { id: string };
    
    if (!id) {
      throw new Response('Not Found', { status: 404 });
    }
    
    try {
      return await queryClient.ensureQueryData(
        dealListApi.getDealByIdOptions(id)
      );
    } catch (error) {
      throw new Response('Failed to load deal', { 
        status: 500,
        statusText: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
};

// Создаем QueryClient с правильными настройками
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут (ранее cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Правильная конфигурация маршрутов
export const productsRoutes: RouteObject[] = [
  {
    path: `/${Routes.DEAL}/${DealRoutes.PRODUCTS}/:id`,
    element: <Products />, // Используйте element вместо component
    loader: productLoader(queryClient), // Выберите нужный loader
    // Или для вложенных маршрутов:
    // children: [
    //   {
    //     path: ':id',
    //     element: <Products />,
    //     loader: productLoader(queryClient),
    //   }
    // ]
  },
];

// АЛЬТЕРНАТИВА: Если нужны несколько loader'ов
export const productsRoutesWithMultipleLoaders: RouteObject[] = [
  {
    path: `/${Routes.DEAL}/${DealRoutes.PRODUCTS}`,
    element: <Products />,
    // Для нескольких loader'ов используйте parent route
    loader: async ({ params, request }) => {
      const { id } = params as { id: string };
      
      // Загружаем основные данные
      const dealData = await productLoader(queryClient)({ params, request });
      
      // Можете загрузить дополнительные данные здесь
      // const extraData = await fetchExtraData(id);
      
      return {
        deal: dealData,
        // extra: extraData
      };
    },
  },
];