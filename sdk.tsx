import { useState, useRef } from 'react';

const useScrollDirection = () => {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  if (typeof window !== 'undefined') {
    window.onscroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrollingDown(currentScrollY > lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };
  }

  return isScrollingDown;
};