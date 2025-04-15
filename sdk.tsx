import { useState, useEffect, useCallback } from 'react';

type UseUrlTabParamOptions<T extends string> = {
  paramName?: string;
  defaultValue?: T;
  validValues: readonly T[];
};

type UseUrlTabParamReturn<T extends string> = [
  T,
  (newValue: T) => void,
  (value: string) => boolean
];

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
  const getInitialValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return defaultValue || validValues[0];
    }

    const params = new URLSearchParams(window.location.search);
    const paramValue = params.get(paramName);

    if (paramValue && validValues.includes(paramValue as T)) {
      return paramValue as T;
    }

    return defaultValue || validValues[0];
  }, [defaultValue, paramName, validValues]);

  const [value, setValue] = useState<T>(getInitialValue);

  // Обновляем URL при изменении значения
  const updateUrl = useCallback((newValue: T) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    url.searchParams.set(paramName, newValue);
    
    // Используем replaceState чтобы не добавлять новую запись в history
    window.history.replaceState(null, '', url.toString());
  }, [paramName]);

  // Устанавливаем новое значение и обновляем URL
  const setTabValue = useCallback((newValue: T) => {
    if (!validValues.includes(newValue)) {
      console.warn(`Value "${newValue}" is not a valid tab value`);
      return;
    }
    
    setValue(newValue);
    updateUrl(newValue);
  }, [updateUrl, validValues]);

  // Проверяем, является ли строка допустимым значением
  const isValidValue = useCallback((value: string): value is T => {
    return validValues.includes(value as T);
  }, [validValues]);

  // Синхронизируем состояние при изменении URL через навигацию (назад/вперед)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const newValue = getInitialValue();
      if (newValue !== value) {
        setValue(newValue);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getInitialValue, value]);

  return [value, setTabValue, isValidValue];
}

export default useUrlTabParam;

import useUrlTabParam from './useUrlTabParam';

// Определяем допустимые значения
const TABS = ['profile', 'settings', 'notifications'] as const;

function App() {
  const [activeTab, setActiveTab, isValidTab] = useUrlTabParam({
    defaultValue: 'profile',
    validValues: TABS,
  });

  return (
    <div>
      <h1>Current Tab: {activeTab}</h1>
      <div>
        {TABS.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            disabled={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div>
        {activeTab === 'profile' && <ProfileComponent />}
        {activeTab === 'settings' && <SettingsComponent />}
        {activeTab === 'notifications' && <NotificationsComponent />}
      </div>
    </div>
  );
}