import { useState, useEffect, useRef, RefObject } from 'react';

const useIsInViewport = (
  options?: IntersectionObserverInit,
  debounceDelay: number = 300
) => {
  const [isInViewport, setIsInViewport] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Очищаем предыдущий таймер
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Устанавливаем новый таймер дебаунса
      debounceTimer.current = setTimeout(() => {
        setIsInViewport(entry.isIntersecting);
      }, debounceDelay);
    }, options);

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [options, debounceDelay]);

  return { ref, isInViewport };
};

export default useIsInViewport;