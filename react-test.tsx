import { useEffect, useRef, useState } from 'react';

interface ScrollDirectionProps {
  children: React.ReactNode;
  onEnterViewport?: (direction: 'top' | 'bottom') => void;
}

const ScrollDirectionDetector = ({ children, onEnterViewport }: ScrollDirectionProps) => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const lastScrollY = useRef(0);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!blockRef.current || !onEnterViewport) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onEnterViewport(scrollDirection === 'down' ? 'top' : 'bottom');
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(blockRef.current);
    return () => observer.disconnect();
  }, [scrollDirection, onEnterViewport]);

  return <div ref={blockRef}>{children}</div>;
};

export default ScrollDirectionDetector;