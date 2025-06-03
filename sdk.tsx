import { useState, useRef, useCallback, useEffect } from 'react';

export function useSmartIntersection() {
    // Состояния видимости
    const [isElementVisible, setIsElementVisible] = useState(false);
    const [areFiltersVisible, setAreFiltersVisible] = useState(false);
    
    // Рефы
    const elementRef = useRef<HTMLElement | null>(null);
    const containerRef = useRef<HTMLElement | null>(null);
    
    // Данные скролла
    const scrollData = useRef({
        lastY: 0,
        isDown: false,
        containerVisible: true
    });

    // Обработчик скролла
    const handleScroll = useCallback(() => {
        const currentY = window.scrollY;
        const isScrollingDown = currentY > scrollData.current.lastY;
        
        scrollData.current = {
            lastY: currentY,
            isDown: isScrollingDown,
            containerVisible: scrollData.current.containerVisible
        };

        // Фильтры видны только при:
        // 1. Скролл вниз
        // 2. Основной элемент не виден
        // 3. Контейнер виден
        setAreFiltersVisible(
            !isElementVisible && 
            isScrollingDown && 
            scrollData.current.containerVisible
        );
    }, [isElementVisible]);

    // Наблюдатель за элементом
    const setElementRef = useCallback((element: HTMLElement | null) => {
        elementRef.current = element;
        
        if (!element) {
            setIsElementVisible(false);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            const visible = entry.isIntersecting;
            setIsElementVisible(visible);
            
            // Автоматически скрываем фильтры при появлении элемента
            if (visible) {
                setAreFiltersVisible(false);
            }
        }, { threshold: 0.1 });

        observer.observe(element);
        
        return () => observer.disconnect();
    }, []);

    // Наблюдатель за контейнером
    const setContainerRef = useCallback((container: HTMLElement | null) => {
        containerRef.current = container;
        
        if (!container) {
            scrollData.current.containerVisible = true;
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            scrollData.current.containerVisible = entry.isIntersecting;
            
            // Если контейнер не виден - сбрасываем все
            if (!entry.isIntersecting) {
                setIsElementVisible(false);
                setAreFiltersVisible(false);
            }
        }, { threshold: 0 });

        observer.observe(container);
        
        return () => observer.disconnect();
    }, []);

    // Эффект для скролла
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return {
        setElementRef,
        setContainerRef,
        isElementVisible,
        areFiltersVisible
    };
}