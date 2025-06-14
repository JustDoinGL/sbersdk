import { useCallback, useEffect, useRef, type RefObject } from "react";

export const useIosScrollToRef = () => {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isIphoneOrIpad = () => /iPhone|iPad/i.test(navigator.userAgent);
  const isSafari = () =>
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const scrollToRef = useCallback((ref: RefObject<HTMLElement | null>) => {
    if (!(isIphoneOrIpad() || isSafari())) return;

    const scroll = () => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(scroll, 0);
  }, []);

  return scrollToRef;
};
