import React, { useState, useRef, useEffect } from 'react';

const CustomScrollComponent = () => {
  const [isHorizontalMode, setIsHorizontalMode] = useState(false);
  const [isHorizontalEnd, setIsHorizontalEnd] = useState(false);
  const containerRef = useRef(null);
  const horizontalContentRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const horizontalContent = horizontalContentRef.current;

    if (!container || !horizontalContent) return;

    const handleWheel = (e) => {
      if (!isHorizontalMode) return;

      // Если мы в горизонтальном режиме и это вертикальный скролл
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        
        const isAtEnd = horizontalContent.scrollLeft + 
                       horizontalContent.clientWidth >= 
                       horizontalContent.scrollWidth - 10;
        
        if (!isAtEnd) {
          // Преобразуем вертикальный скролл в горизонтальный
          horizontalContent.scrollLeft += e.deltaY;
          setIsHorizontalEnd(false);
        } else {
          setIsHorizontalEnd(true);
        }
      }
    };

    const handleScroll = () => {
      const thirdBlock = document.getElementById('third-block');
      if (!thirdBlock) return;

      const rect = thirdBlock.getBoundingClientRect();
      const isThirdBlockVisible = rect.top <= 0 && rect.bottom <= window.innerHeight;

      if (isThirdBlockVisible && !isHorizontalMode) {
        setIsHorizontalMode(true);
        setIsHorizontalEnd(false);
      } else if (!isThirdBlockVisible && isHorizontalMode) {
        setIsHorizontalMode(false);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isHorizontalMode]);

  return (
    <div 
      ref={containerRef}
      style={{
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden'
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
        id="third-block"
        style={{ 
          height: '100vh', 
          backgroundColor: '#ddddff', 
          padding: '20px',
          overflowX: isHorizontalMode ? 'auto' : 'hidden',
          overflowY: 'hidden'
        }}
      >
        <div 
          ref={horizontalContentRef}
          style={{
            width: '200vw',
            height: '100%',
            display: 'flex'
          }}
        >
          <div style={{ minWidth: '100vw', padding: '20px' }}>
            <h1>Блок 3 - Левая часть</h1>
            <p>Скролл вниз = скролл вправо →</p>
          </div>
          <div style={{ minWidth: '100vw', padding: '20px' }}>
            <h1>Блок 3 - Правая часть</h1>
            <p>Продолжайте скроллить вниз (вправо) →</p>
            {isHorizontalEnd && <p>Теперь можно скроллить вниз ↓</p>}
          </div>
        </div>
      </div>

      {/* Блоки после третьего (появляются после горизонтального скролла) */}
      {isHorizontalEnd && (
        <>
          <div style={{ height: '100vh', backgroundColor: '#ffffdd', padding: '20px' }}>
            <h1>Блок 4</h1>
            <p>Снова обычный скролл вниз ↓</p>
          </div>
          <div style={{ height: '100vh', backgroundColor: '#ffddff', padding: '20px' }}>
            <h1>Блок 5</h1>
            <p>Последний блок</p>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomScrollComponent;