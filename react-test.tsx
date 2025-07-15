import { useEffect, useRef, useState } from 'react';

const useScrollDirection = () => {
  const [enteredFromTop, setEnteredFromTop] = useState<boolean | null>(null);
  const lastScrollY = useRef(0);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
      lastScrollY.current = currentScrollY;
      
      if (blockRef.current) {
        const rect = blockRef.current.getBoundingClientRect();
        const isInViewport = rect.top <= window.innerHeight && rect.bottom >= 0;
        
        if (isInViewport) {
          setEnteredFromTop(direction === 'down');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { ref: blockRef, enteredFromTop };
};

export default useScrollDirection;