import { useState, useEffect, useCallback } from 'react';

type UseUrlTabParamOptions<T extends string> = {
  paramName?: string;
  defaultValue?: T;
  validValues: readonly T[];
};

type UseUrlTabParamReturn<T extends string> = {
  value: T;
  setValue: (newValue: T) => void;
  isValidValue: (value: string) => value is T;
  isInitialValue: boolean;
};

function useUrlTabParam<T extends string>(
  options: UseUrlTabParamOptions<T>
): UseUrlTabParamReturn<T> {
  const {
    paramName = 'tab',
    defaultValue,
    validValues,
  } = options;

  // Проверяем, что defaultValue есть в validValues, если он предоставлен
  if (defaultValue && !validValues.includes(defaultValue)) {
    throw new Error(`Default value "${defaultValue}" is not in validValues`);
  }

  // Получаем начальное значение из URL
  const getInitialValue = useCallback((): {value: T; isInitial: boolean} => {
    if (typeof window === 'undefined') {
      return {
        value: defaultValue || validValues[0],
        isInitial: true
      };
    }

    const params = new URLSearchParams(window.location.search);
    const paramValue = params.get(paramName);

    if (paramValue && validValues.includes(paramValue as T)) {
      return {
        value: paramValue as T,
        isInitial: paramValue === defaultValue || (!defaultValue && paramValue === validValues[0])
      };
    }

    return {
      value: defaultValue || validValues[0],
      isInitial: true
    };
  }, [defaultValue, paramName, validValues]);

  const initialValueState = getInitialValue();
  const [value, setValue] = useState<T>(initialValueState.value);
  const [isInitialValue, setIsInitialValue] = useState<boolean>(initialValueState.isInitial);

  // Обновляем URL при изменении значения
  const updateUrl = useCallback((newValue: T, isInitial: boolean) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    url.searchParams.set(paramName, newValue);
    
    window.history.replaceState(null, '', url.toString());
    setIsInitialValue(isInitial);
  }, [paramName]);

  // Устанавливаем новое значение и обновляем URL
  const setTabValue = useCallback((newValue: T) => {
    if (!validValues.includes(newValue)) {
      console.warn(`Value "${newValue}" is not a valid tab value`);
      return;
    }
    
    const isInitial = newValue === defaultValue || (!defaultValue && newValue === validValues[0]);
    setValue(newValue);
    updateUrl(newValue, isInitial);
  }, [updateUrl, validValues, defaultValue]);

  // Проверяем, является ли строка допустимым значением
  const isValidValue = useCallback((value: string): value is T => {
    return validValues.includes(value as T);
  }, [validValues]);

  // Синхронизируем состояние при изменении URL через навигацию (назад/вперед)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const {value: newValue, isInitial} = getInitialValue();
      if (newValue !== value) {
        setValue(newValue);
        setIsInitialValue(isInitial);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getInitialValue, value]);

  return {
    value,
    setValue: setTabValue,
    isValidValue,
    isInitialValue
  };
}

export default useUrlTabParam;