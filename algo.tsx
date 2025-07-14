import React, { useRef, useEffect } from 'react';

const useDualScrollControl = () => {
  const refScroll = useRef<HTMLDivElement>(null); // Контейнер, который скроллится
  const refEventContainer = useRef<HTMLDivElement>(null); // Контейнер, где ловятся события

  useEffect(() => {
    const scrollElement = refScroll.current;
    const eventElement = refEventContainer.current;

    if (!scrollElement || !eventElement) return;

    // --- Обработчик колеса мыши (десктоп) ---
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        scrollElement.scrollLeft += e.deltaY * 0.5; // Регулируем скорость
      }
    };

    // --- Обработчик касаний (мобильные) ---
    let startX: number;
    let scrollLeftStart: number;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      scrollLeftStart = scrollElement.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX) return;
      e.preventDefault();
      const x = e.touches[0].clientX;
      const dragDistance = (x - startX) * 1.5; // Чувствительность
      scrollElement.scrollLeft = scrollLeftStart - dragDistance;
    };

    // Вешаем события на refEventContainer, но скроллим refScroll
    eventElement.addEventListener('wheel', handleWheel, { passive: false });
    eventElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    eventElement.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      eventElement.removeEventListener('wheel', handleWheel);
      eventElement.removeEventListener('touchstart', handleTouchStart);
      eventElement.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return { refScroll, refEventContainer };
};