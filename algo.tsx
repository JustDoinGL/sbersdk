import React, { useRef, useEffect } from 'react';

const useHorizontalScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Обработчик для колеса мыши (десктоп)
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Если скролл вертикальный, предотвращаем и делаем горизонтальным
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    // Обработчик для касаний (мобильные)
    let startX: number;
    let scrollLeft: number;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].pageX;
      scrollLeft = container.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX) return;
      e.preventDefault(); // Предотвращаем стандартный скролл
      const x = e.touches[0].pageX;
      const walk = (x - startX) * 2; // Чувствительность (можно регулировать)
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return containerRef;
};

// Пример использования
const HorizontalScrollContainer = () => {
  const scrollRef = useHorizontalScroll();

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        gap: '16px',
        padding: '8px',
      }}
    >
      {[...Array(10)].map((_, i) => (
        <div key={i} style={{ scrollSnapAlign: 'start', minWidth: '200px', height: '100px', background: '#ddd' }}>
          Item {i + 1}
        </div>
      ))}
    </div>
  );
};