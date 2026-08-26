import React, { useEffect, useRef } from 'react';

interface PreventPullToRefreshProps {
  children: React.ReactNode;
  scrollId: string;
}

const PreventPullToRefresh = ({
  children,
  scrollId,
}: PreventPullToRefreshProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return;
    }

    const container = wrapper.querySelector<HTMLElement>(`#${scrollId}`);

    if (!container) {
      console.warn(`Элемент с ID "${scrollId}" не найден`);
      return;
    }

    let lastTouchY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        return;
      }

      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        return;
      }

      const currentTouchY = e.touches[0].clientY;
      const deltaY = currentTouchY - lastTouchY;

      // Обязательно обновляем координату
      lastTouchY = currentTouchY;

      const { scrollTop, scrollHeight, clientHeight } = container;

      const isAtTop = scrollTop <= 0;
      const isAtBottom =
        scrollTop + clientHeight >= scrollHeight - 1;

      // Палец движется вниз + мы уже наверху.
      // Блокируем pull-to-refresh.
      if (deltaY > 0 && isAtTop) {
        e.preventDefault();
        return;
      }

      // Палец движется вверх + мы уже внизу.
      // Блокируем дальнейший overscroll.
      if (deltaY < 0 && isAtBottom) {
        e.preventDefault();
      }
    };

    wrapper.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });

    wrapper.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });

    return () => {
      wrapper.removeEventListener('touchstart', handleTouchStart);
      wrapper.removeEventListener('touchmove', handleTouchMove);
    };
  }, [scrollId]);

  return (
    <div ref={wrapperRef}>
      {children}
    </div>
  );
};

export default PreventPullToRefresh;