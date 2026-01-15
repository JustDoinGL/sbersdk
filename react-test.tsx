import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  UseQueryResult,
  QueryFunction,
  QueryKey
} from '@tanstack/react-query';
import {
  createBrowserRouter,
  RouterProvider,
  LoaderFunctionArgs,
  useLoaderData,
  useParams,
  Link
} from 'react-router-dom';
import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';

// 1. Типы данных
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface ApiError {
  message: string;
  status: number;
}

// 2. Конфигурация запроса
const productDetailQuery = (id: string): {
  queryKey: QueryKey;
  queryFn: QueryFunction<Product>;
} => ({
  queryKey: ['products', 'detail', id],
  queryFn: async (): Promise<Product> => {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch product ${id}`);
    }
    return res.json();
  },
});

// 3. Тип для загрузчика с queryClient
type LoaderFunctionWithClient = (
  queryClient: QueryClient
) => (args: LoaderFunctionArgs) => Promise<Product>;

// 4. Создание загрузчика
export const productLoader: LoaderFunctionWithClient = (queryClient) => 
  async ({ params }: LoaderFunctionArgs): Promise<Product> => {
    const { id } = params as { id: string };
    const query = productDetailQuery(id);
    
    // Проверяем кэш, если нет данных - загружаем
    const cachedData = queryClient.getQueryData<Product>(query.queryKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Загружаем данные и кэшируем
    return await queryClient.fetchQuery<Product, ApiError>(query);
  };

// 5. Компонент продукта
function Product(): React.JSX.Element {
  const { id } = useParams() as { id: string };
  const initialData = useLoaderData() as Product;
  
  const {
    data: product,
    isPending,
    error
  }: UseQueryResult<Product, ApiError> = useQuery({
    ...productDetailQuery(id),
    initialData,
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 2,
  });

  if (isPending) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Цена: ${product.price}</p>
      <Link to="/products">Назад к списку</Link>
    </div>
  );
}

// 6. Корневой компонент
function Root(): React.JSX.Element {
  return (
    <div>
      <nav>
        <Link to="/products">Товары</Link>
      </nav>
      <div id="detail">
        {/* Outlet для вложенных маршрутов */}
      </div>
    </div>
  );
}

// 7. Создание queryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      gcTime: 10 * 60 * 1000, // 10 минут
    },
  },
});

// 8. Настройка маршрутизатора
const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'product/:id',
        element: <Product />,
        loader: productLoader(queryClient),
        errorElement: <div>Ошибка загрузки продукта</div>,
      },
    ],
  },
]);

// 9. Главный компонент приложения
function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

// 10. Рендеринг
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 11. Дополнительные примеры использования

// Для префетчинга по наведению (в другом компоненте)
function ProductList(): React.JSX.Element {
  const queryClient = useQueryClient();
  
  const prefetchProduct = (id: string): void => {
    queryClient.prefetchQuery(productDetailQuery(id));
  };

  return (
    <div>
      <h2>Список товаров</h2>
      <ul>
        {[1, 2, 3].map((id) => (
          <li key={id}
              onMouseEnter={() => prefetchProduct(id.toString())}>
            <Link to={`/product/${id}`}>
              Товар {id}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Типизированная версия ensureQueryData (если используется)
declare module '@tanstack/react-query' {
  interface QueryClient {
    ensureQueryData<TData = unknown>(
      options: { queryKey: QueryKey; queryFn: QueryFunction<TData> }
    ): Promise<TData>;
  }
}

// Использование ensureQueryData (более новая версия)
export const productLoaderWithEnsure: LoaderFunctionWithClient = (queryClient) => 
  async ({ params }: LoaderFunctionArgs): Promise<Product> => {
    const { id } = params as { id: string };
    const query = productDetailQuery(id);
    
    // ensureQueryData возвращает данные из кэша или загружает их
    return queryClient.ensureQueryData<Product>(query);
  };