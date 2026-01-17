import { createContext, FC, ReactNode, useContext } from "react";
import { NameProducts } from "./1_widgets/test-form";

type NameProductsValue = ReturnType<typeof NameProducts>;

const NameProductsContext = createContext<NameProductsValue | null>(null);

export const useNameProductsContext = () => {
  const ctx = useContext(NameProductsContext);
  if (!ctx) {
    throw new Error("useNameProductsContext must be used inside Provider");
  }
  return ctx;
};

export const NameProductsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const data = NameProducts();
  return <NameProductsContext.Provider value={data}>{children}</NameProductsContext.Provider>;
};




import { FC, ReactNode } from "react";
import { NameProductsProvider, useNameProductsContext } from "./NameProductsProvider";

// Создаем отдельные компоненты для суб-компонентов
const ProductsForm: FC = () => {
  const { Form } = useNameProductsContext();
  return <>{Form}</>;
};

const ProductsButtonController: FC = () => {
  const { ButtonController } = useNameProductsContext();
  return <ButtonController />;
};

// Основной компонент Products
type ProductsProps = {
  product?: number;
  children?: ReactNode;
};

const Products: FC<ProductsProps> = ({ children }) => (
  <NameProductsProvider>{children}</NameProductsProvider>
);

// Прикрепляем суб-компоненты
Products.Form = ProductsForm;
Products.ButtonController = ProductsButtonController;

export { Products };




import { FormProvider, useForm } from "react-hook-form";
import { Button } from "antd";

export const NameProducts = () => {
  const methods = useForm();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < productSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      methods.handleSubmit(onSubmit)();
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const CurrentForm = productSteps[currentStep]?.Component;

  const ButtonController = () => (
    <div>
      <Button onClick={handleNext}>Вперед</Button>
      <Button 
        onClick={handlePrev} 
        disabled={currentStep === 0}
      >
        Назад
      </Button>
    </div>
  );

  const FormStepComponent = (
    <FormProvider {...methods}>
      {CurrentForm && <CurrentForm />}
    </FormProvider>
  );

  return {
    Form: FormStepComponent,
    ButtonController,
    handleNext,
    handlePrev,
    currentStep,
  };
};

// Пример использования продукта
const productSteps = [
  {
    Component: () => <div>Шаг 1</div>,
  },
  {
    Component: () => <div>Шаг 2</div>,
  },
];

const onSubmit = (data: any) => {
  console.log("Форма отправлена:", data);
};


