import { useState, useEffect, useCallback } from 'react';

type UrlParamControl = {
  paramValue: string;
  setParamValue: (newValue: string) => void;
  isDefaultState: boolean;
};

function useUrlParam(paramKey: string = 'tab'): UrlParamControl {
  const getInitialParamState = useCallback((): {
    paramValue: string;
    isDefaultState: boolean;
  } => {
    // Для SSR возвращаем дефолтное состояние
    if (typeof window === 'undefined') {
      return { paramValue: '', isDefaultState: true };
    }

    const searchParams = new URLSearchParams(window.location.search);
    const valueFromUrl = searchParams.get(paramKey);

    return {
      paramValue: valueFromUrl || '',
      isDefaultState: !valueFromUrl // true если параметр отсутствует или пустой
    };
  }, [paramKey]);

  // Инициализация состояния
  const initialParamState = getInitialParamState();
  const [paramValue, setParamValue] = useState<string>(initialParamState.paramValue);
  const [isDefaultState, setIsDefaultState] = useState<boolean>(initialParamState.isDefaultState);

  // Обновление URL при изменении параметра
  const updateUrl = useCallback((newValue: string) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    
    if (!newValue) {
      url.searchParams.delete(paramKey); // Удаляем параметр если значение пустое
    } else {
      url.searchParams.set(paramKey, newValue);
    }
    
    window.history.replaceState(null, '', url.toString());
    setIsDefaultState(!newValue);
  }, [paramKey]);

  // Установка нового значения с обновлением URL
  const handleSetParamValue = useCallback((newValue: string) => {
    setParamValue(newValue);
    updateUrl(newValue);
  }, [updateUrl]);

  // Синхронизация при навигации по истории
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUrlChange = () => {
      const { paramValue: newValue, isDefaultState: newIsDefault } = getInitialParamState();
      if (newValue !== paramValue) {
        setParamValue(newValue);
        setIsDefaultState(newIsDefault);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [getInitialParamState, paramValue]);

  return {
    paramValue,
    setParamValue: handleSetParamValue,
    isDefaultState
  };
}

export default useUrlParam;