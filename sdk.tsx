import { useState, useCallback, useRef, useEffect } from 'react';

export function useIntersection() {
    const [isVisible, setIsVisible] = useState(false);
    const [isVisibleFilters, setIsVisibleFilters] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastScrollY = useRef(0);
    const isScrollingDown = useRef(false);

    // Обработчик скролла
    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;
        isScrollingDown.current = currentScrollY > lastScrollY.current;
        lastScrollY.current = currentScrollY;

        // При скролле вверх сразу скрываем фильтры
        if (!isScrollingDown.current) {
            setIsVisibleFilters(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const setRef = useCallback((element: HTMLElement | null) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        if (element) {
            const observer = new IntersectionObserver(([entry]) => {
                const isElementVisible = entry.isIntersecting;
                setIsVisible(isElementVisible);

                // Фильтры видны только если:
                // 1. Элемент скрыт (!isElementVisible)
                // 2. Пользователь скроллит ВНИЗ (isScrollingDown.current)
                setIsVisibleFilters(!isElementVisible && isScrollingDown.current);
            }, { threshold: 0.1 });

            observer.observe(element);
            observerRef.current = observer;
        } else {
            setIsVisible(false);
            setIsVisibleFilters(false);
        }
    }, []);

    return [setRef, isVisible, isVisibleFilters] as const;
}