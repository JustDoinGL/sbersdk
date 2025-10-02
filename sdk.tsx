// useFormStore.ts
import { useSyncExternalStore, useRef, useEffect, useCallback } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { formStore } from './formStore';
import { FormCrmData } from './types';

export const useFormStore = () => {
  const state = useSyncExternalStore(formStore.subscribe, formStore.getSnapshot);
  
  const methods = useForm<FormCrmData>({
    mode: 'onTouched',
    resolver: zodResolver(formSchemaCrm),
    defaultValues: state.formData // инициализация значениями из стора
  });

  const { control, setValue, getValues } = methods;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Регистрация ref для скролла
  useEffect(() => {
    if (scrollRef.current) {
      formStore.registerScrollRef(scrollRef);
    }
  }, []);

  // Синхронизация изменений ИЗ формы В стор
  const currentFormValues = useWatch({ control });

  useEffect(() => {
    // При изменении значений в форме - обновляем стор
    formStore.setFormData(currentFormValues);
  }, [currentFormValues]);

  // Синхронизация изменений ИЗ стора В форму
  useEffect(() => {
    const { formData } = state;
    const currentValues = getValues();
    
    // Проверяем, какие поля изменились в сторе и обновляем форму
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof FormCrmData;
      if (formData[fieldName] !== currentValues[fieldName]) {
        setValue(fieldName, formData[fieldName], {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      }
    });
  }, [state.formData, setValue, getValues]);

  // Функция для установки значения в обе системы
  const setFieldValue = useCallback(<K extends keyof FormCrmData>(
    fieldName: K, 
    value: FormCrmData[K]
  ) => {
    // Устанавливаем в react-hook-form
    setValue(fieldName, value, {
      shouldValidate: true,
      shouldDirty: true
    });
    // Устанавливаем в стор
    formStore.setFieldValue(fieldName, value);
  }, [setValue]);

  const FormProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return {
    ...state,
    ...methods,
    scrollRef,
    FormProvider: FormProviderWrapper,
    setFieldValue,
    setState: formStore.setState,
    setStep: formStore.setStep,
    scrollToElement: formStore.scrollToElement
  };
};

// formStore.ts
interface FormCrmData {
  PhoneNumber: string;
  Email?: string;
  Name?: string;
  // добавьте другие поля по необходимости
}

interface FormState {
  isSecondStep: boolean;
  formData: FormCrmData;
  scrollElementRef: React.RefObject<HTMLElement> | null;
  timerId: NodeJS.Timeout | null;
}

let formState: FormState = {
  isSecondStep: false,
  formData: {
    PhoneNumber: '',
    Email: '',
    Name: ''
  },
  scrollElementRef: null,
  timerId: null
};

let listeners: (() => void)[] = [];

export const formStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  
  getSnapshot() {
    return formState;
  },
  
  // Установка значения поля и синхронизация
  setFieldValue<K extends keyof FormCrmData>(fieldName: K, value: FormCrmData[K]) {
    formState.formData[fieldName] = value;
    listeners.forEach((listener) => listener());
  },
  
  // Установка всех данных формы
  setFormData(data: Partial<FormCrmData>) {
    formState.formData = { ...formState.formData, ...data };
    listeners.forEach((listener) => listener());
  },
  
  // Получение значения конкретного поля
  getFieldValue<K extends keyof FormCrmData>(fieldName: K): FormCrmData[K] {
    return formState.formData[fieldName];
  },
  
  setStep(isSecondStep: boolean) {
    formState.isSecondStep = isSecondStep;
    listeners.forEach((listener) => listener());
  },
  
  registerScrollRef(ref: React.RefObject<HTMLElement>) {
    formState.scrollElementRef = ref;
    listeners.forEach((listener) => listener());
  },
  
  scrollToElement() {
    if (formState.scrollElementRef?.current) {
      formState.scrollElementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  },
  
  clearTimer() {
    if (formState.timerId) {
      clearTimeout(formState.timerId);
      formState.timerId = null;
    }
  },
  
  setTimer(timerId: NodeJS.Timeout) {
    formState.timerId = timerId;
    listeners.forEach((listener) => listener());
  }
};
