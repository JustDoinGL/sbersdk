import { useCallback } from 'react';

const useScrollToTop = () => {
  const scrollToTop = useCallback(() => {
    const start = window.pageYOffset;
    const step = () => {
      window.scrollTo(0, start - start / 8); // Упрощенная анимация
      if (window.pageYOffset > 0) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, []);

  return scrollToTop;
};

// Использование
const Component = () => {
  const scrollToTop = useScrollToTop();

  return (
    <button onClick={scrollToTop}>
      Наверх
    </button>
  );
};