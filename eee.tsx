import { useRef, useCallback, RefObject } from 'react';

export const useSharedScroll = <T extends HTMLElement = HTMLElement>(
  options: ScrollIntoViewOptions = { behavior: 'smooth' }
) => {
  const elementRef = useRef<T>(null);

  const scrollToElement = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView(options);
    }
  }, [options]);

  return {
    elementRef,
    scrollToElement
  };
};