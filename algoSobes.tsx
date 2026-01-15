import { useState, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/* 
  Тип для схемы формы - любой объект Zod, 
  но в основном используется для объектов и их пересечений
*/
type FormSchema = z.ZodObject<any> | z.ZodIntersection<z.ZodObject<any>, z.ZodObject<any>>;

/* 
  Аргументы для useFormProvider 
*/
interface UseFormProviderArgs<S extends FormSchema> {
  /* Схема, описывающая форму */
  productForm: S;
  /* Начальные значения, совпадающие с выводом схемы */
  defaultValues: z.infer<S>;
  /* Обработчик отправки */
  onSubmit: (data: z.infer<S>) => Promise<void>;
  /* Шаги. Каждый шаг содержит компонент и поля, которые проверяются */
  productSteps: {
    Component: ReactNode;
    /* Поля, которые проверяются на текущем шаге */
    fields: Array<keyof z.infer<S>>;
  }[];
}

/* 
  Возвращаемый тип
*/
interface UseFormProviderReturn<S extends FormSchema> {
  /* JSX-компонент текущего шага */
  FormStepComponent: ReactNode;
  /* Методы react-hook-form */
  methods: ReturnType<typeof useForm<z.infer<S>>>;
  /* Переход к следующему шагу */
  handleNext: () => Promise<void>;
  /* Переход к предыдущему шагу */
  handlePrev: () => void;
  /* Текущий индекс шага */
  currentStep: number;
}

export const useFormProvider = <S extends FormSchema>({
  productForm,
  defaultValues,
  onSubmit,
  productSteps,
}: UseFormProviderArgs<S>): UseFormProviderReturn<S> => {
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm<z.infer<S>>({
    resolver: zodResolver(productForm),
    mode: "onChange",
    defaultValues,
  });

  const { handleSubmit, trigger, formState } = methods;

  const handleNext = async () => {
    const fields = productSteps[currentStep].fields;
    if (!fields.length) {
      return;
    }

    /* 
      Преобразуем массив ключей в массив строк для trigger.
      Поскольку trigger принимает (FieldPath<z.infer<S>> | FieldPath<z.infer<S>>[]) | undefined,
      а у нас точно есть массив строк, которые являются ключами схемы,
      используем 'as' с типом FieldPath<z.infer<S>>[]
    */
    type FieldPathType = Parameters<typeof trigger>[0];
    
    const isValid = await trigger(fields as FieldPathType);
    if (!isValid) return;

    if (currentStep < productSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return {
    FormStepComponent: productSteps[currentStep]?.Component || null,
    methods,
    handleNext,
    handlePrev,
    currentStep,
  };
};

// Альтернативная, более строгая версия типов, если нужна явная типизация для trigger:

// Создаем вспомогательный тип для пути к полю
type FieldPaths<T> = T extends object ? {
  [K in keyof T]: K extends string 
    ? T[K] extends object 
      ? `${K}.${FieldPaths<T[K]>}` | K
      : K
    : never
}[keyof T] : never;

// Более строгая версия useFormProvider с явным типом для fields:
export const useFormProviderStrict = <S extends FormSchema>({
  productForm,
  defaultValues,
  onSubmit,
  productSteps,
}: UseFormProviderArgs<S>): UseFormProviderReturn<S> => {
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm<z.infer<S>>({
    resolver: zodResolver(productForm),
    mode: "onChange",
    defaultValues,
  });

  const { handleSubmit, trigger } = methods;

  const handleNext = async () => {
    const fields = productSteps[currentStep].fields;
    if (!fields.length) {
      return;
    }

    // Для строгой типизации используем явное приведение типов
    const fieldPaths = fields as Array<FieldPaths<z.infer<S>>>;
    
    const isValid = await trigger(fieldPaths as any);
    if (!isValid) return;

    if (currentStep < productSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  return {
    FormStepComponent: productSteps[currentStep]?.Component || null,
    methods,
    handleNext,
    handlePrev,
    currentStep,
  };
};