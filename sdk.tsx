import { useState, useRef, useCallback, useEffect } from 'react';

export function useScrollVisibility() {
    // Состояния видимости
    const [isBlockVisible, setIsBlockVisible] = useState(false);
    const [isContainerVisible, setIsContainerVisible] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    // Данные скролла
    const scrollData = useRef({
        lastY: 0,
        isScrollingDown: false
    });

    // Рефы для элементов
    const blockRef = useCallback((node: HTMLElement | null) => {
        if (!node) return;
        
        const observer = new IntersectionObserver(([entry]) => {
            setIsBlockVisible(entry.isIntersecting);
            // Если блок стал видимым - скрываем фильтры
            if (entry.isIntersecting) {
                setShowFilters(false);
            }
        }, { threshold: 0.1 });

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const containerRef = useCallback((node: HTMLElement | null) => {
        if (!node) {
            setIsContainerVisible(false);
            return;
        }
        
        const observer = new IntersectionObserver(([entry]) => {
            const visible = entry.isIntersecting;
            setIsContainerVisible(visible);
            // Если контейнер скрылся - скрываем всё
            if (!visible) {
                setIsBlockVisible(false);
                setShowFilters(false);
            }
        }, { threshold: 0 });

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    // Обработчик скролла
    const handleScroll = useCallback(() => {
        const currentY = window.scrollY;
        const isDown = currentY > scrollData.current.lastY;
        
        scrollData.current = {
            lastY: currentY,
            isScrollingDown: isDown
        };

        // Обновляем видимость фильтров по правилам:
        // 1. Должны быть в контейнере (isContainerVisible)
        // 2. Блок не должен быть виден (!isBlockVisible)
        // 3. Для фильтров: только при скролле вниз (isDown)
        const shouldShowFilters = 
            isContainerVisible && 
            !isBlockVisible && 
            (isDown || !showFilters); // Сохраняем состояние если скроллим вверх
        
        setShowFilters(shouldShowFilters);
    }, [isContainerVisible, isBlockVisible, showFilters]);

    // Эффект для скролла
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return {
        blockRef,
        containerRef,
        showFilters,
        showResetButton: isContainerVisible && !isBlockVisible
    };
}