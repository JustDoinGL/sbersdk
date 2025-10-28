import { Multiselect, Button } from 'sg-uikit';
import { useState, useRef, useCallback } from 'react';

// Хук для дебаунса без useEffect
const useDebounceCallback = (callback, delay) => {
    const timeoutRef = useRef(null);

    const debouncedCallback = useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);

    return debouncedCallback;
};

const ManagersSelector = () => {
    const [selectedManagers, setSelectedManagers] = useState([]);
    const [managersOptions, setManagersOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Функция поиска менеджеров
    const searchManagers = useCallback(async (query) => {
        if (!query.trim()) {
            setManagersOptions([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/managers?search=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            const options = data.map(manager => ({
                label: `${manager.name} ${manager.surname} (${manager.department})`,
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
    const handleInputChange = useCallback((value) => {
        debouncedSearchManagers(value);
    }, [debouncedSearchManagers]);

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
            onSelect={setSelectedManagers}
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