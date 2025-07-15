import React, { useRef, useEffect } from 'react';

interface HorizontalScrollProps {
  children: React.ReactNode;
  onNext?: () => void;    // Функция при достижении правого края
  onPrev?: () => void;    // Функция при достижении левого края
  sensitivity?: number;   // Чувствительность скролла (по умолчанию 1)
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
  children,
  onNext,
  onPrev,
  sensitivity = 1
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const isDragging = useRef(false);

  // Проверка достижения краев
  const checkScrollEdges = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const tolerance = 10; // Допуск в пикселях

    // Правый край
    if (scrollLeft + clientWidth >= scrollWidth - tolerance) {
      onNext?.();
    }
    // Левый край
    else if (scrollLeft <= tolerance) {
      onPrev?.();
    }
  };

  // Обработчик колеса мыши
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (!scrollRef.current) return;
    
    scrollRef.current.scrollLeft += e.deltaY * sensitivity;
    checkScrollEdges();
  };

  // Touch-обработчики для мобильных
  const handleTouchStart = (e: TouchEvent) => {
    if (!scrollRef.current) return;
    startX.current = e.touches[0].clientX;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
    isDragging.current = true;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    
    const x = e.touches[0].clientX;
    const dragDistance = (x - startX.current) * sensitivity;
    scrollRef.current.scrollLeft = scrollLeftStart.current - dragDistance;
    checkScrollEdges();
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Подписываемся на события
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      style={{
        overflowX: 'auto',
        display: 'flex',
        width: '100%',
        scrollSnapType: 'x mandatory',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        cursor: 'grab',
        userSelect: 'none'
      }}
      onMouseDown={() => (document.body.style.cursor = 'grabbing')}
      onMouseUp={() => (document.body.style.cursor = 'grab')}
      onMouseLeave={() => (document.body.style.cursor = 'grab')}
    >
      {React.Children.map(children, (child) => (
        <div style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default HorizontalScroll;