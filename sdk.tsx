import { useState, useCallback, useRef } from 'react';

export function useIntersection() {
    const [isVisible, setIsVisible] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const setRef = useCallback((element: HTMLElement | null) => {
        // Отключаем предыдущий observer
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        if (element) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    setIsVisible(entry.isIntersecting);
                },
                { threshold: 0.1 } // Настройка: срабатывает при 10% видимости
            );

            observer.observe(element);
            observerRef.current = observer;
        } else {
            setIsVisible(false); // Если элемент исчез (например, unmount)
        }
    }, []); // Пустой массив зависимостей = observer создаётся только один раз

    return [setRef, isVisible] as const;
}