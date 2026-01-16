import { LoaderFunctionArgs, RouteObject } from "react-router-dom";
import { dealListApi } from "@4_entities/deal";
import { QueryClient } from "@tanstack/react-query";
import { DealRoutes, Routes } from "@5_shared/routes/routes.desktop";
import { RouteErrorBoundary, ProductLoader } from "./product-error-boundary";
import { DealDto } from "@5_shared/api";

const queryClient = new QueryClient();

const productLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id as string;
  if (!id) {
    throw new Response("Product ID is required", { status: 400 });
  }

  try {
    const deal = await queryClient.fetchQuery({
      queryKey: ['deal', id],
      queryFn: () => dealListApi.getDealByID({ id }),
      staleTime: 60 * 1000, // 1 минута
    });

    if (!deal) {
      throw new Response("Product not found", { status: 404 });
    }

    return { deal };
  } catch (error) {
    // Преобразуем ошибку TanStack Query в Response
    throw new Response("Failed to load product", { 
      status: 500,
      statusText: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const productsRoutes: RouteObject[] = [
  {
    path: Routes.DEAL, // Используйте конкретный путь
    element: <ProductLoader />,
    loader: productLoader,
    errorElement: <RouteErrorBoundary />,
  },
];

import { 
  isRouteErrorResponse, 
  useRouteError, 
  Await, 
  useLoaderData,
  useAsyncValue,
  useAsyncError 
} from "react-router-dom";
import { ErrorBoundary, Spinner, Text } from "@sg/uikit";
import { Suspense } from "react";
import { Products } from "./app";
import { DealDto } from "@5_shared/api";
import { FC } from "react";

// Компонент для отображения загруженной сделки
const DealContent: FC = () => {
  const deal = useAsyncValue() as DealDto;
  return <Products deal={deal} />;
};

// Компонент для обработки ошибок в Await
const DealError: FC = () => {
  const error = useAsyncError();
  return <Text>Ошибка загрузки сделки: {error?.toString()}</Text>;
};

export const ProductLoader = () => {
  const loaderData = useLoaderData() as { deal: Promise<DealDto> };

  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <Await 
          resolve={loaderData.deal}
          errorElement={<DealError />}
        >
          <DealContent />
        </Await>
      </Suspense>
    </ErrorBoundary>
  );
};

export const RouteErrorBoundary = () => {
  const error = useRouteError();

  return (
    <Text>
      {isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText || "Ошибка загрузки"}`
        : "Неизвестная ошибка"}
    </Text>
  );
};
