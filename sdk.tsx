import { useState, useRef, useCallback, useEffect } from 'react';

export function useSmartIntersection() {
    // Состояния видимости
    const [elementStates, setElementStates] = useState<Record<string, {
        isVisible: boolean;
        isFiltersVisible: boolean;
    }>>({});

    // Рефы
    const observers = useRef<Record<string, IntersectionObserver>>({});
    const containerObserver = useRef<IntersectionObserver | null>(null);
    const scrollData = useRef({
        lastY: 0,
        isDown: false,
        containerVisible: true
    });

    // Обработчик скролла
    const handleScroll = useCallback(() => {
        const currentY = window.scrollY;
        scrollData.current.isDown = currentY > scrollData.current.lastY;
        scrollData.current.lastY = currentY;

        // Обновляем состояния всех элементов при скролле
        setElementStates(prev => {
            const newStates = { ...prev };
            for (const key in newStates) {
                // Фильтры видны только при скролле вниз и когда элемент не виден
                newStates[key].isFiltersVisible = 
                    !newStates[key].isVisible && 
                    scrollData.current.isDown &&
                    scrollData.current.containerVisible;
            }
            return newStates;
        });
    }, []);

    // Наблюдатель за контейнером
    const setContainerRef = useCallback((container: HTMLElement | null) => {
        if (containerObserver.current) {
            containerObserver.current.disconnect();
        }

        if (container) {
            const observer = new IntersectionObserver(([entry]) => {
                scrollData.current.containerVisible = entry.isIntersecting;
                
                // Если контейнер не виден - сбрасываем все состояния
                if (!entry.isIntersecting) {
                    setElementStates(prev => {
                        const resetStates = { ...prev };
                        for (const key in resetStates) {
                            resetStates[key] = {
                                isVisible: false,
                                isFiltersVisible: false
                            };
                        }
                        return resetStates;
                    });
                }
            }, { threshold: 0 });

            observer.observe(container);
            containerObserver.current = observer;
        } else {
            scrollData.current.containerVisible = true; // Если нет контейнера - считаем видимым
        }
    }, []);

    // Наблюдатель для элемента
    const registerElement = useCallback((id: string, element: HTMLElement | null) => {
        // Очищаем предыдущий наблюдатель
        if (observers.current[id]) {
            observers.current[id].disconnect();
            delete observers.current[id];
        }

        if (element) {
            const observer = new IntersectionObserver(([entry]) => {
                setElementStates(prev => ({
                    ...prev,
                    [id]: {
                        isVisible: entry.isIntersecting,
                        isFiltersVisible: 
                            !entry.isIntersecting && 
                            scrollData.current.isDown &&
                            scrollData.current.containerVisible
                    }
                }));
            }, { threshold: 0.1 });

            observer.observe(element);
            observers.current[id] = observer;

            // Инициализация состояния
            if (!elementStates[id]) {
                setElementStates(prev => ({
                    ...prev,
                    [id]: {
                        isVisible: false,
                        isFiltersVisible: false
                    }
                }));
            }
        }
    }, []);

    // Эффекты
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return {
        registerElement,
        setContainerRef,
        getElementState: (id: string) => elementStates[id] || { 
            isVisible: false, 
            isFiltersVisible: false 
        }
    };
}