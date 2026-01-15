// routes/product.jsx (продолжение)
import { useQuery } from '@tanstack/react-query';
import { useLoaderData, useParams } from 'react-router-dom';

export default function Product() {
  const { id } = useParams();
  // Получите данные, предзагруженные загрузчиком
  const initialData = useLoaderData();
  
  // Используйте тот же запрос. useQuery возьмет данные из кэша.
  const { data: product, isPending } = useQuery({
    ...productDetailQuery(id),
    initialData, // Это гарантирует, что data не будет undefined[citation:2]
  });

  if (isPending) return <div>Загрузка...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}


// routes/product.jsx
import { getQueryData, fetchQuery } from '@tanstack/react-query';

// 1. Определите конфигурацию запроса
const productDetailQuery = (id) => ({
  queryKey: ['products', 'detail', id],
  queryFn: async () => {
    const res = await fetch(`/api/products/${id}`);
    return res.json();
  },
});

// 2. Создайте загрузчик, который принимает queryClient
export const productLoader = (queryClient) => async ({ params }) => {
  const query = productDetailQuery(params.id);
  
  // Ключевая логика: вернуть данные из кэша, если они есть, иначе загрузить
  return (
    queryClient.getQueryData(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
};

// Альтернатива с ensureQueryData (доступен с v4.22.0)
export const productLoader = (queryClient) => async ({ params }) => {
  const query = productDetailQuery(params.id);
  return queryClient.ensureQueryData(query);
};


// main.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Root } from './routes/root';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'product/:id',
        element: <Product />,
        // Загрузчику будет передан queryClient
        loader: productLoader(queryClient),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);




