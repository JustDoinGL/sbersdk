import { FC, ReactNode } from "react";
import { NameProductsProvider, useNameProductsContext } from "./NameProductsProvider";

// Типы для суб-компонентов
const ProductsForm: FC = () => {
  const { Form } = useNameProductsContext();
  return <>{Form}</>;
};

const ProductsButtonController: FC = () => {
  const { ButtonController } = useNameProductsContext();
  return <ButtonController />;
};

// Основные пропсы для Products
type ProductsProps = {
  product?: number;
  children?: ReactNode;
};

// Тип для компонента Products с суб-компонентами
type ProductsComponent = FC<ProductsProps> & {
  Form: FC;
  ButtonController: FC;
};

// Основной компонент
const Products: ProductsComponent = ({ children }) => (
  <NameProductsProvider>{children}</NameProductsProvider>
);

// Прикрепляем суб-компоненты
Products.Form = ProductsForm;
Products.ButtonController = ProductsButtonController;

export { Products };