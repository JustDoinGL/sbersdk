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
            observerRef.current = new IntersectionObserver(([entry]) => {
                // Обновляем состояние только если изменилась видимость
                if (entry.isIntersecting !== isVisible) {
                    setIsVisible(entry.isIntersecting);
                }
            });

            observerRef.current.observe(element);
        } else {
            setIsVisible(false); // Если элемент исчез (например, unmount)
        }
    }, [isVisible]);

    return [setRef, isVisible] as const;
}