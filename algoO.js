import { FC, JSX, ReactNode } from "react";
import { ProductContext } from "./useProductsContext";
import { NameProducts } from "./../2_widgets/test-form";

// Тип для маппера продуктов
type ProductMapper = Record<number, () => {
  Form: () => JSX.Element;
  ButtonController: () => JSX.Element;
}>;

// Создаем маппер функций, а не результатов
const productsMapper: ProductMapper = {
  32: NameProducts,
  // Добавьте другие продукты:
  // 33: AnotherProductFunction,
  // 34: YetAnotherProductFunction,
};

type Props = {
  children: ReactNode;
  productCode: number;
};

export const ProductsProvider: FC<Props> = ({ children, productCode }) => {
  // Получаем функцию для нужного продукта
  const productFunction = productsMapper[productCode];

  if (!productFunction) {
    return <div>Product not found: {productCode}</div>;
  }

  // Вызываем функцию чтобы получить данные
  const product = productFunction();

  return <ProductContext.Provider value={product}>{children}</ProductContext.Provider>;
};





import { createContext, JSX, useContext } from "react";

export type ProductValue = {
  Form: () => JSX.Element;
  ButtonController: () => JSX.Element;
};

export const ProductContext = createContext<ProductValue | null>(null);

export const useProductsContext = () => {
  const ctx = useContext(ProductContext);

  if (!ctx) {
    throw new Error("useProductsContext must be used inside Provider");
  }

  return ctx;
};






import { FC, ReactNode } from "react";
import { useProductsContext } from "./useProductsContext";
import { ProductsProvider } from "./product_context";

// Суб-компоненты
const ProductsFormController: FC = () => {
  const { Form } = useProductsContext();
  return <Form />;
};

const ProductsButtonController: FC = () => {
  const { ButtonController } = useProductsContext();
  return <ButtonController />;
};

// Основные пропсы
type ProductsProps = {
  product: number;
  children?: ReactNode;
};

// Тип для компонента с суб-компонентами
type ProductsComponent = FC<ProductsProps> & {
  Form: FC;
  Button: FC;
};

// Основной компонент
const Products: ProductsComponent = ({ children, product }) => (
  <ProductsProvider productCode={product}>{children}</ProductsProvider>
);

// Прикрепляем суб-компоненты
Products.Form = ProductsFormController;
Products.Button = ProductsButtonController;

export { Products };


