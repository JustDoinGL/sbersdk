import { useState, useEffect, useRef, RefObject } from 'react';

export function useMultiIntersection(
  options?: IntersectionObserverInit
): [
  (element: HTMLElement | null) => void,
  (element: HTMLElement | null) => void,
  (element: HTMLElement | null) => void,
  [boolean, boolean, boolean]
] {
  const [visibility, setVisibility] = useState([false, false, false]);
  const elementsRef = useRef<(HTMLElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const createObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const index = elementsRef.current.indexOf(entry.target as HTMLElement);
        if (index >= 0) {
          setVisibility(prev => {
            const newVisibility = [...prev];
            newVisibility[index] = entry.isIntersecting;
            return newVisibility;
          });
        }
      });
    }, options);

    elementsRef.current.forEach(element => {
      if (element) observerRef.current?.observe(element);
    });
  }, [options]);

  const createRefCallback = (index: number) => 
    (element: HTMLElement | null) => {
      elementsRef.current[index] = element;
      createObserver();
    };

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [
    createRefCallback(0),
    createRefCallback(1),
    createRefCallback(2),
    visibility
  ];
}