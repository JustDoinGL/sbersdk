import { useState, useRef, useCallback, useEffect } from 'react';

export function useScrollVisibility() {
    // Состояния видимости
    const [isBlockVisible, setIsBlockVisible] = useState(false);
    const [isContainerVisible, setIsContainerVisible] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    // Рефы и наблюдатели
    const blockObserver = useRef<IntersectionObserver | null>(null);
    const containerObserver = useRef<IntersectionObserver | null>(null);
    const blockElement = useRef<HTMLElement | null>(null);
    const containerElement = useRef<HTMLElement | null>(null);

    // Данные скролла
    const scrollData = useRef({
        lastY: 0,
        isScrollingDown: false
    });

    // Очистка наблюдателей
    const cleanupObservers = useCallback(() => {
        blockObserver.current?.disconnect();
        blockObserver.current = null;
        containerObserver.current?.disconnect();
        containerObserver.current = null;
    }, []);

    // Настройка наблюдателя для блока
    const setupBlockObserver = useCallback(() => {
        if (!blockElement.current) return;

        blockObserver.current?.disconnect();
        blockObserver.current = new IntersectionObserver(([entry]) => {
            setIsBlockVisible(entry.isIntersecting);
            if (entry.isIntersecting) {
                setShowFilters(false);
            }
        }, { threshold: 0.1 });

        blockObserver.current.observe(blockElement.current);
    }, []);

    // Настройка наблюдателя для контейнера
    const setupContainerObserver = useCallback(() => {
        if (!containerElement.current) {
            setIsContainerVisible(false);
            return;
        }

        containerObserver.current?.disconnect();
        containerObserver.current = new IntersectionObserver(([entry]) => {
            const visible = entry.isIntersecting;
            setIsContainerVisible(visible);
            if (!visible) {
                setIsBlockVisible(false);
                setShowFilters(false);
            }
        }, { threshold: 0 });

        containerObserver.current.observe(containerElement.current);
    }, []);

    // Рефы для элементов
    const blockRef = useCallback((node: HTMLElement | null) => {
        blockElement.current = node;
        if (node) {
            setupBlockObserver();
        } else {
            setIsBlockVisible(false);
        }
    }, [setupBlockObserver]);

    const containerRef = useCallback((node: HTMLElement | null) => {
        containerElement.current = node;
        if (node) {
            setupContainerObserver();
        } else {
            setIsContainerVisible(false);
        }
    }, [setupContainerObserver]);

    // Обработчик скролла
    const handleScroll = useCallback(() => {
        const currentY = window.scrollY;
        const isDown = currentY > scrollData.current.lastY;
        
        scrollData.current = {
            lastY: currentY,
            isScrollingDown: isDown
        };

        const shouldShowFilters = 
            isContainerVisible && 
            !isBlockVisible && 
            isDown;

        setShowFilters(shouldShowFilters);
    }, [isContainerVisible, isBlockVisible]);

    // Эффекты
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            cleanupObservers();
        };
    }, [handleScroll, cleanupObservers]);

    return {
        blockRef,
        containerRef,
        showFilters,
        showResetButton: isContainerVisible && !isBlockVisible
    };
}