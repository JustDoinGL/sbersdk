import { useState, useEffect, useRef, MutableRefObject } from 'react';

const useIsVisible = <T extends HTMLElement>(): [boolean, MutableRefObject<T | null>] => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null, // используем viewport
        rootMargin: '0px',
        threshold: 0.1, // срабатывает когда 10% элемента видно
      }
    );

    const currentElement = ref.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return [isVisible, ref];
};

export default useIsVisible;