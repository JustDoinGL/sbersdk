import React, { FC, ReactNode } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  UseQueryOptions,
  ensureQueryData
} from '@tanstack/react-query';
import {
  createBrowserRouter,
  RouterProvider,
  RouteObject,
  LoaderFunctionArgs,
  useLoaderData,
  useParams
} from 'react-router-dom';
import ReactDOM from 'react-dom/client';

// ========== ТИПЫ ==========
interface DealDto {
  id: string;
  product: string;
  title: string;
  price: number;
}

// ========== API МОДЕЛЬ ==========
const dealListApi = {
  getDealByIdOptions: (id: string): UseQueryOptions<DealDto, Error, DealDto, [string, string]> => ({
    queryKey: ['deal', id],
    queryFn: async (): Promise<DealDto> => {
      console.log(`Fetching deal ${id} from API...`);
      const res = await fetch(`/api/deals/${id}`);
      if (!res.ok) throw new Error('Failed to fetch deal');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  }),
};

// ========== LOADER ==========
const productLoader = (queryClient: QueryClient) => 
  async ({ params, request }: LoaderFunctionArgs): Promise<DealDto> => {
    const { id } = params as { id: string };
    const url = new URL(request.url);
    const isPrefetch = url.searchParams.has("_prefetch");

    console.log(`${isPrefetch ? "Prefetching" : "Loading"} deal ${id}`);
    
    // Ключевое исправление: ensureQueryData проверяет кэш и загружает только если нужно
    return await ensureQueryData<DealDto>(
      queryClient,
      dealListApi.getDealByIdOptions(id)
    );
  };

// ========== КОМПОНЕНТ PRODUCTS ==========
const NameProducts: FC = () => <div>Special Product Component</div>;

const products: Record<string, ReactNode> = {
  '32': <NameProducts />,
};

export const Products: FC = () => {
  const { id } = useParams() as { id: string };
  
  // 1. Получаем данные из loader
  const initialData = useLoaderData() as DealDto;
  
  // 2. Используем хук с initialData
  const { data, isLoading, isError } = useQuery<DealDto, Error>({
    ...dealListApi.getDealByIdOptions(id),
    initialData, // Ключевая строка - предотвращает дублирующий запрос
  });

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (isError) {
    return <>Ошибка</>;
  }

  if (data && products[data.product]) {
    return products[data.product];
  }

  return <>{data?.product || id}</>;
};

// ========== КОНФИГУРАЦИЯ ROUTES ==========
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      refetchOnWindowFocus: false,
    },
  },
});

export const productsRoutes: RouteObject[] = [
  {
    path: '/deals/:id/products',
    element: <Products />,
    loader: productLoader(queryClient),
  },
];

// ========== ПРИМЕР ИСПОЛЬЗОВАНИЯ PREFETCH ==========
const DealList: FC = () => {
  const handlePrefetch = (dealId: string) => {
    // Префетчим данные при наведении
    queryClient.prefetchQuery(dealListApi.getDealByIdOptions(dealId));
  };

  return (
    <div>
      <h2>Список сделок</h2>
      {['1', '2', '3'].map((dealId) => (
        <div
          key={dealId}
          onMouseEnter={() => handlePrefetch(dealId)}
          style={{ padding: '10px', border: '1px solid #ccc', margin: '5px' }}
        >
          <a href={`/deals/${dealId}/products`}>Сделка {dealId}</a>
        </div>
      ))}
    </div>
  );
};

// ========== ОСНОВНОЙ РОУТЕР ==========
const router = createBrowserRouter([
  {
    path: '/',
    element: <DealList />,
  },
  ...productsRoutes,
]);

// ========== КОРНЕВОЙ КОМПОНЕНТ ==========
const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

// ========== РЕНДЕРИНГ ==========
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ========== АЛЬТЕРНАТИВНЫЙ ВАРИАНТ LOADER (без ensureQueryData) ==========
const productLoaderAlternative = (queryClient: QueryClient) => 
  async ({ params }: LoaderFunctionArgs): Promise<DealDto> => {
    const { id } = params as { id: string };
    const options = dealListApi.getDealByIdOptions(id);
    
    // Вручную проверяем кэш
    const cached = queryClient.getQueryData<DealDto>(options.queryKey);
    if (cached) {
      console.log(`Taking deal ${id} from cache`);
      return cached;
    }
    
    console.log(`Fetching deal ${id} from server`);
    return await queryClient.fetchQuery<DealDto, Error>(options);
  };

// ========== ТИПИЗИРОВАННАЯ ВЕРСИЯ ДЛЯ СТРОГОЙ ТИПИЗАЦИИ ==========
type StrictLoaderFunction = (
  queryClient: QueryClient
) => (args: LoaderFunctionArgs) => Promise<DealDto>;

const strictProductLoader: StrictLoaderFunction = (queryClient) => 
  async ({ params }) => {
    const { id } = params as { id: string };
    
    const queryOptions: UseQueryOptions<DealDto, Error, DealDto, [string, string]> = {
      queryKey: ['deal', id],
      queryFn: async () => {
        const response = await fetch(`/api/deals/${id}`);
        return response.json();
      },
      staleTime: 300000,
    };
    
    return ensureQueryData(queryClient, queryOptions);
  };