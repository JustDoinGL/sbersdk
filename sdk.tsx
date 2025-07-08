import React, { useRef, useEffect } from 'react';

// Кастомный хук
const useHorizontalScrollOnVerticalScroll = (
  horizontalScrollRef: React.RefObject<HTMLElement>,
  outerContainerRef: React.RefObject<HTMLElement>
) => {
  useEffect(() => {
    const outerContainer = outerContainerRef.current;
    const horizontalContainer = horizontalScrollRef.current;

    if (!outerContainer || !horizontalContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = outerContainer;
      const scrollableWidth = horizontalContainer.scrollWidth - horizontalContainer.clientWidth;
      
      // Рассчитываем прогресс вертикального скролла (от 0 до 1)
      const verticalProgress = scrollTop / (scrollHeight - clientHeight);
      
      // Применяем прогресс к горизонтальному скроллу
      horizontalContainer.scrollLeft = scrollableWidth * verticalProgress;
    };

    outerContainer.addEventListener('scroll', handleScroll);

    return () => {
      outerContainer.removeEventListener('scroll', handleScroll);
    };
  }, [horizontalScrollRef, outerContainerRef]);
};

// Компонент
const HorizontalScrollOnVerticalScroll = () => {
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const outerContainerRef = useRef<HTMLDivElement>(null);

  useHorizontalScrollOnVerticalScroll(horizontalScrollRef, outerContainerRef);

  return (
    <div
      ref={outerContainerRef}
      style={{
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <div style={{ height: '200vh', padding: '20px' }}>
        <h2>Прокрутите вниз, чтобы увидеть горизонтальный скролл</h2>
        
        <div style={{ height: '50px' }}>Блок 1</div>
        <div style={{ height: '50px' }}>Блок 2</div>
        
        {/* Горизонтально скроллящийся блок */}
        <div
          ref={horizontalScrollRef}
          style={{
            height: '150px',
            overflowX: 'auto',
            overflowY: 'hidden',
            whiteSpace: 'nowrap',
            border: '1px solid #ccc',
            margin: '20px 0',
          }}
        >
          {/* 5 блоков с контентом */}
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              style={{
                display: 'inline-block',
                width: '300px',
                height: '100%',
                backgroundColor: `hsl(${item * 60}, 70%, 80%)`,
                marginRight: '10px',
                padding: '10px',
                boxSizing: 'border-box',
              }}
            >
              Блок {item}
              {item === 3 && (
                <div style={{ fontWeight: 'bold', color: 'red' }}>
                  Этот блок будет виден при полном скролле вниз
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div style={{ height: '50px' }}>Блок 4</div>
        <div style={{ height: '50px' }}>Блок 5</div>
      </div>
    </div>
  );
};

export default HorizontalScrollOnVerticalScroll;