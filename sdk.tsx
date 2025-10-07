import { useEffect, useRef } from 'react';

interface UseScrollUpProps {
  callback: () => void;
  condition?: boolean;
}

const useScrollUp = ({ callback, condition = true }: UseScrollUpProps) => {
  const lastScrollY = useRef(0);
  const isScrollingUp = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Определяем направление скролла
      if (currentScrollY < lastScrollY.current) {
        isScrollingUp.current = true;
      } else {
        isScrollingUp.current = false;
      }

      // Если скролл вверх и условие выполнено - вызываем колбек
      if (isScrollingUp.current && condition) {
        callback();
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [callback, condition]);
};

export default useScrollUp;