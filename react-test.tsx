import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  QueryKey,
  QueryFunction
} from '@tanstack/react-query';
import {
  createBrowserRouter,
  RouterProvider,
  LoaderFunctionArgs,
  useLoaderData,
  useParams,
  Link,
  PrefetchPageLinks
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

// 2. Конфигурация запроса
const productDetailQuery = (id: string): {
  queryKey: QueryKey;
  queryFn: QueryFunction<Product>;
} => ({
  queryKey: ['products', 'detail', id],
  queryFn: async (): Promise<Product> => {
    console.log(`Fetching product ${id}...`);
    const res = await fetch(`/api/products/${id}`);
    return res.json();
  },
});

// 3. Загрузчик для префетчинга
export const productLoader = (queryClient: QueryClient) => 
  async ({ params, request }: LoaderFunctionArgs): Promise<Product> => {
    const { id } = params as { id: string };
    const url = new URL(request.url);
    
    // Определяем, префетчинг это или обычная загрузка
    const isPrefetch = url.searchParams.has('_prefetch');
    
    console.log(`${isPrefetch ? 'Prefetching' : 'Loading'} product ${id}`);
    
    const query = productDetailQuery(id);
    
    // Проверяем кэш
    const cachedData = queryClient.getQueryData<Product>(query.queryKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Загружаем и кэшируем
    return await queryClient.fetchQuery<Product>(query);
  };

// 4. Компонент продукта
function Product(): React.JSX.Element {
  const { id } = useParams() as { id: string };
  const initialData = useLoaderData() as Product;
  
  const { data: product, isPending } = useQuery({
    ...productDetailQuery(id),
    initialData,
  });

  if (isPending) return <div>Загрузка...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Цена: ${product.price}</p>
      <Link to="/">На главную</Link>
    </div>
  );
}

// 5. Главная страница с префетчингом ссылок
function Home(): React.JSX.Element {
  return (
    <div>
      <h1>Товары</h1>
      
      {/* 1. Префетчинг по наведению (intent) */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Префетчинг по наведению:</h3>
        <Link 
          to="/product/1" 
          prefetch="intent" // Срабатывает при наведении или фокусе
        >
          Товар 1 (intent)
        </Link>
      </div>
      
      {/* 2. Немедленный префетчинг (render) */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Немедленный префетчинг:</h3>
        <Link 
          to="/product/2" 
          prefetch="render" // Префетчится сразу при рендере ссылки
        >
          Товар 2 (render)
        </Link>
      </div>
      
      {/* 3. Без префетчинга */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Без префетчинга:</h3>
        <Link to="/product/3">
          Товар 3 (none)
        </Link>
      </div>
      
      {/* 4. Префетчинг с View Transition API */}
      <div style={{ marginBottom: '20px' }}>
        <h3>С View Transitions:</h3>
        <Link 
          to="/product/4" 
          prefetch="intent"
          unstable_viewTransition
        >
          Товар 4 (с анимацией)
        </Link>
      </div>
      
      {/* 5. Программный префетчинг */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Программный префетчинг:</h3>
        <button
          onClick={() => {
            // Можно использовать useNavigate для префетчинга
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = '/product/5';
            document.head.appendChild(link);
          }}
        >
          Префетч товара 5 (JS)
        </button>
      </div>
    </div>
  );
}

// 6. Компонент префетчинга через <PrefetchPageLinks>
function PrefetchComponent(): React.JSX.Element {
  return (
    <div>
      {/* Этот компонент рендерит <link rel="prefetch"> для страницы */}
      <PrefetchPageLinks page="/product/100" />
      <p>Страница /product/100 будет префетчена</p>
    </div>
  );
}

// 7. Настройка маршрутизатора
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/product/:id',
    element: <Product />,
    loader: productLoader(queryClient),
  },
  {
    path: '/prefetch',
    element: <PrefetchComponent />,
  },
]);

// 8. Главное приложение
function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider 
        router={router}
        // Опционально: глобальная конфигурация префетчинга
        future={{
          v7_prependBasename: true,
        }}
      />
    </QueryClientProvider>
  );
}

// 9. Рендеринг
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);