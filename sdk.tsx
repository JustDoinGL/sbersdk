import { useState, useRef, useCallback, RefCallback } from 'react';

export function useIntersection(options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const setRef: RefCallback<HTMLElement> = useCallback((element) => {
    // Отключаем предыдущий observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    elementRef.current = element;

    if (element) {
      observerRef.current = new IntersectionObserver(([entry]) => {
        setIsVisible(entry.isIntersecting);
      }, options);

      observerRef.current.observe(element);
    }
  }, [options]);

  return {
    ref: setRef,
    isVisible,
    element: elementRef.current,
  } as const;
}