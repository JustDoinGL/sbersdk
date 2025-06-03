import { useState, useCallback, useRef, useEffect } from 'react';

export function useIntersection() {
    // Состояния видимости
    const [isVisible, setIsVisible] = useState(false);
    const [isVisibleFilters, setIsVisibleFilters] = useState(false);
    const [isVisibleContainer, setIsVisibleContainer] = useState(false);
    
    // Рефы для наблюдателей и скролла
    const observerRef = useRef<IntersectionObserver | null>(null);
    const observerContainerRef = useRef<IntersectionObserver | null>(null);
    const lastScrollY = useRef(0);
    const isScrollingDown = useRef(false);

    // Обработчик скролла
    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;
        isScrollingDown.current = currentScrollY > lastScrollY.current;
        lastScrollY.current = currentScrollY;

        // Если скроллим вверх - сразу скрываем фильтры
        if (!isScrollingDown.current) {
            setIsVisibleFilters(false);
        }
    }, []);

    // Эффект для добавления/удаления обработчика скролла
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Наблюдатель для основного блока
    const setRef = useCallback((element: HTMLElement | null) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        if (element) {
            const observer = new IntersectionObserver(([entry]) => {
                const isElementVisible = entry.isIntersecting;
                setIsVisible(isElementVisible);
                
                // Фильтры видны только если:
                // 1. Элемент не виден
                // 2. Скроллим вниз
                // 3. Контейнер виден
                setIsVisibleFilters(!isElementVisible && isScrollingDown.current && isVisibleContainer);
            }, { threshold: 0.1 });

            observer.observe(element);
            observerRef.current = observer;
        } else {
            setIsVisible(false);
            setIsVisibleFilters(false);
        }
    }, [isVisibleContainer]);

    // Наблюдатель для контейнера
    const setRefContainer = useCallback((element: HTMLElement | null) => {
        if (observerContainerRef.current) {
            observerContainerRef.current.disconnect();
        }

        if (element) {
            const observer = new IntersectionObserver(([entry]) => {
                const isContainerVisible = entry.isIntersecting;
                setIsVisibleContainer(isContainerVisible);
                
                // Если контейнер стал невидимым - скрываем все
                if (!isContainerVisible) {
                    setIsVisible(false);
                    setIsVisibleFilters(false);
                }
            }, { threshold: 0 });

            observer.observe(element);
            observerContainerRef.current = observer;
        } else {
            setIsVisibleContainer(false);
        }
    }, []);

    return { 
        setRef, 
        setRefContainer, 
        isVisible, 
        isVisibleFilters,
        isVisibleContainer
    } as const;
}