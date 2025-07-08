import React, { useState, useRef, useEffect } from 'react';

const HorizontalThenVerticalScroll = () => {
  const [enableVerticalScroll, setEnableVerticalScroll] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        // Проверяем, достигли ли мы конца горизонтального скролла
        const isAtHorizontalEnd = 
          container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
        
        if (isAtHorizontalEnd && !enableVerticalScroll) {
          setEnableVerticalScroll(true);
        } else if (!isAtHorizontalEnd && enableVerticalScroll) {
          setEnableVerticalScroll(false);
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [enableVerticalScroll]);

  return (
    <div 
      ref={scrollContainerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflowX: enableVerticalScroll ? 'hidden' : 'scroll',
        overflowY: enableVerticalScroll ? 'scroll' : 'hidden',
        whiteSpace: 'nowrap',
        transition: 'overflow 0.3s ease'
      }}
    >
      {/* Широкий контент для горизонтального скролла */}
      <div style={{
        display: 'inline-block',
        width: '200vw',
        height: '100vh',
        backgroundColor: '#f0f0f0'
      }}>
        <div style={{ padding: '20px' }}>
          <h1>Горизонтальный скролл</h1>
          <p>Прокрутите вправо →</p>
        </div>
      </div>
      
      {/* Длинный контент для вертикального скролла (после горизонтального) */}
      <div style={{
        display: 'inline-block',
        width: '100vw',
        height: '200vh',
        backgroundColor: '#e0e0e0'
      }}>
        <div style={{ padding: '20px' }}>
          <h1>Вертикальный скролл</h1>
          <p>Теперь можно прокручивать вниз ↓</p>
        </div>
      </div>
    </div>
  );
};

export default HorizontalThenVerticalScroll;