import { Multiselect, Button } from 'sg-uikit';
import { useState, useRef, useCallback } from 'react';

// Типы для менеджера
interface Manager {
  id: string;
  name: string;
  surname: string;
  department?: string;
  fullName?: string;
}

// Типы для опций MultiSelect
interface Option {
  label: string;
  value: string;
}

// Пропсы для компонента (если нужны)
interface ManagersSelectorProps {
  // Можно добавить дополнительные пропсы при необходимости
}

// Хук для дебаунса без useEffect
const useDebounceCallback = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  return debouncedCallback;
};

const ManagersSelector: React.FC<ManagersSelectorProps> = () => {
  const [selectedManagers, setSelectedManagers] = useState<Option[]>([]);
  const [managersOptions, setManagersOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Функция поиска менеджеров
  const searchManagers = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) {
      setManagersOptions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/managers?search=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Manager[] = await response.json();
      
      const options: Option[] = data.map(manager => ({
        label: manager.fullName || `${manager.name} ${manager.surname}${manager.department ? ` (${manager.department})` : ''}`,
        value: manager.id,
      }));
      
      setManagersOptions(options);
    } catch (error) {
      console.error('Ошибка при поиске менеджеров:', error);
      setManagersOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Дебаунс версия функции поиска
  const debouncedSearchManagers = useDebounceCallback(searchManagers, 300);

  // Обработчик изменения input (поиска)
  const handleInputChange = useCallback((value: string) => {
    debouncedSearchManagers(value);
  }, [debouncedSearchManagers]);

  // Обработчик выбора менеджеров
  const handleSelect = useCallback((selected: Option[]) => {
    setSelectedManagers(selected);
  }, []);

  // Очистка всех выбранных менеджеров
  const handleClear = useCallback(() => {
    setSelectedManagers([]);
    setManagersOptions([]);
  }, []);

  return (
    <Multiselect
      label="Выберите менеджеров"
      placeholder="Начните вводить имя менеджера..."
      options={managersOptions}
      selected={selectedManagers}
      onSelect={handleSelect}
      onInputChange={handleInputChange}
      selectedItemsDisplayMode="below"
      hasCheckbox={false}
      isLoading={isLoading}
      buttonClear={
        <Button variant="ghost" onClick={handleClear}>
          Очистить все
        </Button>
      }
      maxLength={undefined}
    />
  );
};

export default ManagersSelector;