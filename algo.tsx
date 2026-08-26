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

    const container = wrapper.querySelector<HTMLElement>(
      `#${scrollId}`,
    );

    if (!container) {
      console.warn(
        `Элемент с ID "${scrollId}" не найден`,
      );

      return;
    }

    let lastTouchY = 0;

    // Где начался текущий touch gesture
    let gestureStartedInside = false;

    /**
     * Начало касания
     */
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        return;
      }

      const target = e.target as Node;

      // Проверяем, начался ли gesture внутри scroll-container
      gestureStartedInside = container.contains(target);

      lastTouchY = e.touches[0].clientY;
    };

    /**
     * Движение пальца
     */
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        return;
      }

      /**
       * Gesture начался вне scroll-container.
       *
       * Не позволяем странице скроллиться.
       */
      if (!gestureStartedInside) {
        e.preventDefault();
        return;
      }

      const currentY = e.touches[0].clientY;

      // deltaY > 0 — палец движется вниз
      // deltaY < 0 — палец движется вверх
      const deltaY = currentY - lastTouchY;

      // Сохраняем текущую позицию для следующего события
      lastTouchY = currentY;

      const {
        scrollTop,
        scrollHeight,
        clientHeight,
      } = container;

      const isMovingDown = deltaY > 0;
      const isMovingUp = deltaY < 0;

      /**
       * Контейнер находится в самом верху.
       */
      const isAtTop = scrollTop <= 0;

      /**
       * Контейнер находится в самом низу.
       */
      const isAtBottom =
        scrollTop + clientHeight >=
        scrollHeight - 1;

      /**
       * Мы вверху и пользователь тянет вниз.
       *
       * Не позволяем странице делать pull-to-refresh.
       */
      if (isMovingDown && isAtTop) {
        e.preventDefault();
        return;
      }

      /**
       * Мы внизу и пользователь тянет вверх.
       *
       * Не позволяем уйти в overscroll.
       */
      if (isMovingUp && isAtBottom) {
        e.preventDefault();
      }
    };

    /**
     * Начало touch gesture отслеживаем на document,
     * чтобы видеть события даже за пределами контейнера.
     */
    document.addEventListener(
      'touchstart',
      handleTouchStart,
      {
        passive: true,
      },
    );

    /**
     * touchmove должен быть passive: false,
     * иначе preventDefault() не сработает.
     */
    document.addEventListener(
      'touchmove',
      handleTouchMove,
      {
        passive: false,
      },
    );

    /**
     * Cleanup
     */
    return () => {
      document.removeEventListener(
        'touchstart',
        handleTouchStart,
      );

      document.removeEventListener(
        'touchmove',
        handleTouchMove,
      );
    };
  }, [scrollId]);

  return (
    <div ref={wrapperRef}>
      {children}
    </div>
  );
};

export default PreventPullToRefresh;