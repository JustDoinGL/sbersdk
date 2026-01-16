import { FC } from "react";
import { NameProducts } from "./1_widgets/test-form";

const products: Record<number, JSX.Element> = {
  32: <NameProducts />,
};

export const Products: FC = () => {
  const { deal } = useAsyncValue() as { deal: { product: { id: number } } };
  
  const productId = deal.product.id;
  const productComponent = products[productId];
  
  if (productComponent) {
    return productComponent;
  }
  
  return <>Адаптируйте компонент для продукта с номером {productId}</>;
};

import { LoaderFunctionArgs, RouteObject } from "react-router";
import { dealListApi } from "@4_entities/deal";
import { QueryClient } from "@tanstack/react-query";
import { DealRoutes, Routes } from "@5_shared/routes/routes.deskTop";
import { RouteErrorBoundary, ProductLoader } from "./product-error-boundary";

const queryClient = new QueryClient();

const productLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id as string;
  if (!id) {
    throw new Response("Product ID is required", { status: 400 });
  }

  try {
    const deal = await queryClient.fetchQuery(
      dealListApi.getDealById({ id })
    );

    if (!deal) {
      throw new Response("Product not found", { status: 404 });
    }

    return { deal };
  } catch (error) {
    throw new Response("Failed to load product", { status: 500 });
  }
};

export const productsRoutes: RouteObject[] = [
  {
    path: `${Routes.DEAL}${DealRoutes.PRODUCTS}`,
    element: <ProductLoader />,
    loader: productLoader,
    errorElement: <RouteErrorBoundary />,
  },
];


// В product-error-boundary.tsx (B189316D-76C8-4F45-BAEC-2575860D1C0D.jpeg)
export const ProductLoader = () => {
  const { deal } = useLoaderData() as { deal: DealDto };

  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <Await resolve={deal}>
          <Products />
        </Await>
      </Suspense>
    </ErrorBoundary>
  );
};



// products-with-loader.tsx
import { Suspense } from "react";
import { Spinner } from "@sg/uikit";
import { Products } from "./products";

export const ProductsWithLoader = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Products />
    </Suspense>
  );
};

// Затем используйте его в роутах:
// element: <ProductsWithLoader />,




