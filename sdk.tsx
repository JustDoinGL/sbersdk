import { useState, useCallback, useRef, useEffect } from 'react';

export function useIntersection() {
    const [isVisible, setIsVisible] = useState(false);
    const [isVisibleFilters, setIsVisibleFilters] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastScrollY = useRef(0);
    const isScrollingDown = useRef(false);

    // Обработчик скролла для определения направления
    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;
        isScrollingDown.current = currentScrollY > lastScrollY.current;
        lastScrollY.current = currentScrollY;
    }, []);

    // Эффект для добавления/удаления обработчика скролла
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const setRef = useCallback((element: HTMLElement | null) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        if (element) {
            const observer = new IntersectionObserver(([entry]) => {
                setIsVisible(entry.isIntersecting);
                // Если элемент не виден и скроллим вниз - показываем фильтры
                setIsVisibleFilters(!entry.isIntersecting && isScrollingDown.current);
            }, {
                threshold: 0.1
            });
            
            observer.observe(element);
            observerRef.current = observer;
        } else {
            setIsVisible(false);
            setIsVisibleFilters(false);
        }
    }, []);

    return [setRef, isVisible, isVisibleFilters] as const;
}