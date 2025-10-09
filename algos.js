import { useCallback, useRef } from "react";

export function useIntersection(onIntersect: () => void) {
  const unsubscribe = useRef<(() => void) | null>(null);

  return useCallback((el: HTMLDivElement | null) => {
    if (el) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((intersection) => {
          if (intersection.isIntersecting) {
            onIntersect();
          }
        });
      });

      observer.observe(el);
      unsubscribe.current = () => observer.disconnect();
    } else {
      unsubscribe.current?.();
    }
  }, [onIntersect]);
}