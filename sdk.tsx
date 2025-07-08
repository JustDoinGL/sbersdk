import React, { useState, useRef, useEffect } from 'react';

const SmoothScrollTransition = () => {
  const [scrollMode, setScrollMode] = useState('vertical');
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const horizontalSectionRef = useRef(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const horizontalSection = horizontalSectionRef.current;
    const content = contentRef.current;

    if (!container || !horizontalSection || !content) return;

    const handleWheel = (e) => {
      if (isScrolling.current) return;
      
      // Проверяем, находимся ли мы в горизонтальной секции
      const rect = horizontalSection.getBoundingClientRect();
      const isInHorizontalSection = rect.top <= 0 && rect.bottom > 0;

      if (isInHorizontalSection && scrollMode !== 'horizontal') {
        setScrollMode('horizontal');
        return;
      }

      if (!isInHorizontalSection && scrollMode !== 'vertical') {
        setScrollMode('vertical');
        return;
      }

      if (scrollMode === 'horizontal') {
        // Проверяем, достигли ли мы конца горизонтального скролла
        const isAtEnd = content.scrollLeft + content.clientWidth >= content.scrollWidth - 10;
        
        if (!isAtEnd) {
          e.preventDefault();
          isScrolling.current = true;
          
          // Плавный горизонтальный скролл
          content.scrollBy({
            left: e.deltaY,
            behavior: 'smooth'
          });

          setTimeout(() => {
            isScrolling.current = false;
          }, 200);
        } else {
          // Переключаемся обратно на вертикальный скролл
          setScrollMode('vertical');
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [scrollMode]);

  return (
    <div 
      ref={containerRef}
      style={{
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollBehavior: 'smooth'
      }}
    >
      {/* Блок 1 */}
      <div style={{ height: '100vh', backgroundColor: '#ffdddd', padding: '20px' }}>
        <h1>Блок 1</h1>
        <p>Скролл вниз ↓</p>
      </div>

      {/* Блок 2 */}
      <div style={{ height: '100vh', backgroundColor: '#ddffdd', padding: '20px' }}>
        <h1>Блок 2</h1>
        <p>Продолжайте скроллить вниз ↓</p>
      </div>

      {/* Блок 3 с горизонтальным контентом */}
      <div 
        ref={horizontalSectionRef}
        style={{ 
          height: '100vh', 
          backgroundColor: '#ddddff', 
          padding: '20px',
          overflowX: scrollMode === 'horizontal' ? 'auto' : 'hidden',
          overflowY: 'hidden'
        }}
      >
        <div 
          ref={contentRef}
          style={{
            width: '200vw',
            height: '100%',
            display: 'flex',
            transition: 'transform 0.3s ease'
          }}
        >
          <div style={{ minWidth: '100vw', padding: '20px' }}>
            <h1>Горизонтальная секция (левая часть)</h1>
            <p>Скролл вниз теперь двигает вправо →</p>
          </div>
          <div style={{ minWidth: '100vw', padding: '20px' }}>
            <h1>Горизонтальная секция (правая часть)</h1>
            <p>Продолжайте скроллить вниз (вправо) →</p>
            {scrollMode === 'vertical' && <p>Теперь можно скроллить вниз ↓</p>}
          </div>
        </div>
      </div>

      {/* Блок 4 (появляется после горизонтального скролла) */}
      <div style={{ height: '100vh', backgroundColor: '#ffffdd', padding: '20px' }}>
        <h1>Блок 4</h1>
        <p>Снова обычный скролл вниз ↓</p>
      </div>

      {/* Блок 5 */}
      <div style={{ height: '100vh', backgroundColor: '#ffddff', padding: '20px' }}>
        <h1>Блок 5</h1>
        <p>Последний блок</p>
      </div>
    </div>
  );
};

export default SmoothScrollTransition;