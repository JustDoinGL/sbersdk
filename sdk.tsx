import { useState, ReactNode, Fragment, ReactElement } from 'react';
import { useForm, UseFormReturn, FieldValues, FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodTypeAny, ZodObject, ZodIntersection, ZodEffects } from 'zod';

/* 
  Более гибкий тип для схемы - поддерживает ZodObject, ZodIntersection и ZodEffects (для трансформаций)
*/
type FormSchema = 
  | ZodObject<any> 
  | ZodIntersection<ZodTypeAny, ZodTypeAny>
  | ZodEffects<ZodTypeAny>;

/* 
  Получаем тип данных из схемы, независимо от её структуры
*/
type InferFormData<S extends FormSchema> = S extends ZodEffects<infer T> 
  ? z.infer<T> 
  : z.infer<S>;

/* 
  Получаем ключи формы с поддержкой вложенных структур
*/
type FormKeys<S extends FormSchema> = keyof InferFormData<S>;

/* 
  Аргументы для useFormProvider 
*/
interface UseFormProviderArgs<S extends FormSchema> {
  /* Схема формы */
  productForm: S;
  /* Начальные значения */
  defaultValues: InferFormData<S>;
  /* Обработчик отправки */
  onSubmit: (data: InferFormData<S>) => Promise<void>;
  /* Шаги формы */
  productSteps: {
    Component: ReactElement;
    fields: FormKeys<S>[];
  }[];
}

/* 
  Возвращаемый тип
*/
interface UseFormProviderReturn<S extends FormSchema> {
  /* Методы react-hook-form */
  methods: UseFormReturn<InferFormData<S>>;
  /* JSX-компонент текущего шага */
  FormStepComponent: ReactElement;
  /* Переход к следующему шагу */
  handleNext: () => Promise<void>;
  /* Переход к предыдущему шагу */
  handlePrev: () => void;
  /* Текущий индекс шага */
  currentStep: number;
}

/* 
  Хук useFormProvider
*/
export const useFormProvider = <S extends FormSchema>({
  productForm,
  defaultValues,
  onSubmit,
  productSteps,
}: UseFormProviderArgs<S>): UseFormProviderReturn<S> => {
  const [currentStep, setCurrentStep] = useState(0);

  // Используем правильный тип для методов формы
  const methods = useForm<InferFormData<S>>({
    resolver: zodResolver(productForm as ZodTypeAny),
    mode: "onChange" as const,
    defaultValues,
  });

  const { handleSubmit, trigger } = methods;

  const handleNext = async () => {
    const currentStepData = productSteps[currentStep];
    if (!currentStepData?.fields?.length) {
      return;
    }

    // Получаем поля текущего шага
    const fields = currentStepData.fields;

    // Преобразуем ключи в FieldPath для trigger
    const fieldPaths = fields.map(field => 
      String(field)
    ) as FieldPath<InferFormData<S>>[];

    // Проверяем только поля текущего шага
    const isValid = await trigger(fieldPaths);
    if (!isValid) return;

    // Переходим к следующему шагу
    if (currentStep < productSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Подготавливаем обработчик отправки формы
  const handleFormSubmit = handleSubmit(onSubmit);

  return {
    methods,
    FormStepComponent: productSteps[currentStep]?.Component || <Fragment />,
    handleNext,
    handlePrev,
    currentStep,
  };
};

/* 
  Компонент-обёртка для формы
*/
interface FormProviderProps<S extends FormSchema> extends UseFormProviderArgs<S> {
  children: ReactNode;
}

export const FormProvider = <S extends FormSchema>({
  productForm,
  defaultValues,
  onSubmit,
  productSteps,
  children,
}: FormProviderProps<S>) => {
  const { methods, FormStepComponent, handleNext, handlePrev, currentStep } = useFormProvider({
    productForm,
    defaultValues,
    onSubmit,
    productSteps,
  });

  return (
    <Fragment>
      {/* Рендерим методы формы для дочерних компонентов */}
      {children}
      
      {/* Рендерим компонент текущего шага */}
      {FormStepComponent}
      
      {/* Кнопки навигации */}
      <div>
        <button type="button" onClick={handleNext}>
          Вперед
        </button>
        <button 
          type="button" 
          onClick={handlePrev} 
          disabled={currentStep === 0}
        >
          Назад
        </button>
      </div>
    </Fragment>
  );
};

/* 
  Пример использования с конкретной схемой
*/
import { SubmitHandler } from 'react-hook-form';

// 1. Создаем схему с пересечениями
const baseSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

const additionalSchema = z.object({
  checkBox: z.boolean(),
  firstName2: z.string(),
  lastName2: z.string(),
}).refine(
  (data) => !data.checkBox || (data.firstName2 && data.lastName2),
  {
    message: "Если чекбокс отмечен, заполните дополнительные поля",
    path: ["checkBox"],
  }
);

const cardsSchema = z.object({
  cards: z.array(z.object({
    firstName5: z.string(),
    lastName5: z.string(),
  }))
});

// Объединяем схемы
const productFormSchema = baseSchema
  .and(additionalSchema)
  .and(cardsSchema);

// 2. Получаем тип данных
type ProductForm = z.infer<typeof productFormSchema>;

// 3. Пример компонента формы
export const ProductFormComponent = () => {
  // Определяем начальные значения
  const defaultValues: ProductForm = {
    firstName: '',
    lastName: '',
    checkBox: false,
    firstName2: '',
    lastName2: '',
    cards: [],
  };

  // Обработчик отправки с правильным типом
  const handleSubmit: SubmitHandler<ProductForm> = async (formData) => {
    // formData имеет тип ProductForm
    console.log('Отправка данных:', formData);
    // Ваша логика отправки
  };

  return (
    <FormProvider
      productForm={productFormSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      productSteps={[
        {
          Component: <div>Шаг 1: Основные данные</div>,
          fields: ['firstName', 'lastName'] as FormKeys<typeof productFormSchema>[],
        },
        {
          Component: <div>Шаг 2: Дополнительные данные</div>,
          fields: ['checkBox', 'firstName2', 'lastName2'] as FormKeys<typeof productFormSchema>[],
        },
        {
          Component: <div>Шаг 3: Карточки</div>,
          fields: ['cards'] as FormKeys<typeof productFormSchema>[],
        },
      ]}
    >
      {/* Дочерние компоненты получат доступ к methods через FormProvider */}
    </FormProvider>
  );
};