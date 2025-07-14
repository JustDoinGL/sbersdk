import React, { useRef, useEffect, useState } from 'react';

interface VisibilityProviderProps {
  children: React.ReactNode;
}

interface ScrollRefs {
  left: React.RefObject<HTMLDivElement>;
  right: React.RefObject<HTMLDivElement>;
}

const useScrollVisibility = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftArrowRef = useRef<HTMLDivElement>(null);
  const rightArrowRef = useRef<HTMLDivElement>(null);
  const [isLeftVisible, setIsLeftVisible] = useState(false);
  const [isRightVisible, setIsRightVisible] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);

  // Horizontal scroll effect
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleWheel = (event: WheelEvent) => {
      if (!event.deltaY) return;
      element.scrollLeft += event.deltaY * 0.5;
      event.preventDefault();
    };

    element.addEventListener('wheel', handleWheel);
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);

  // Visibility observers for arrows and container
  useEffect(() => {
    const container = containerRef.current;
    const leftArrow = leftArrowRef.current;
    const rightArrow = rightArrowRef.current;

    if (!container || !leftArrow || !rightArrow) return;

    const containerObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    const leftObserver = new IntersectionObserver(
      ([entry]) => {
        setIsLeftVisible(entry.isIntersecting);
      },
      {
        root: container,
        threshold: 0.1,
      }
    );

    const rightObserver = new IntersectionObserver(
      ([entry]) => {
        setIsRightVisible(entry.isIntersecting);
      },
      {
        root: container,
        threshold: 0.1,
      }
    );

    containerObserver.observe(container);
    leftObserver.observe(leftArrow);
    rightObserver.observe(rightArrow);

    return () => {
      containerObserver.unobserve(container);
      leftObserver.unobserve(leftArrow);
      rightObserver.unobserve(rightArrow);
    };
  }, []);

  const VisibilityProvider: React.FC<VisibilityProviderProps> = ({ children }) => {
    return (
      <div ref={containerRef} style={{ overflowX: 'auto', position: 'relative' }}>
        <div ref={leftArrowRef} style={{ position: 'absolute', left: 0 }} />
        {children}
        <div ref={rightArrowRef} style={{ position: 'absolute', right: 0 }} />
      </div>
    );
  };

  return {
    VisibilityProvider,
    containerRef,
    isLeftVisible,
    isRightVisible,
    isInViewport,
  };
};

interface TopOffersProps {
  id: string;
  title: string;
}

const TopOffers: React.FC<TopOffersProps> = ({ id, title }) => {
  const { VisibilityProvider, containerRef, isLeftVisible, isRightVisible, isInViewport } = useScrollVisibility();

  return (
    <section id={id}>
      <h2>{title}</h2>
      <VisibilityProvider>
        {/* Your content here */}
        <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
          {/* Items that will be horizontally scrolled */}
        </div>
      </VisibilityProvider>
    </section>
  );
};

export default TopOffers;