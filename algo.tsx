import { useEffect, useState, RefObject } from 'react';

interface UseActiveScrollIndexProps {
  /** Количество элементов */
  itemsCount: number;
  /** Порог срабатывания в процентах от 0 до 100 */
  threshold?: number;
  /** Начинать отсчет с 0 или с 1 */
  startFromZero?: boolean;
}

/**
 * Хук для определения активного элемента по скроллу внутри контейнера
 * @param containerRef - реф на элемент с скроллом
 * @param options - настройки
 * @returns индекс активного элемента
 */
function useActiveScrollIndex(
  containerRef: RefObject<HTMLElement>,
  options: UseActiveScrollIndexProps
): number {
  const { itemsCount, threshold = 35, startFromZero = false } = options;
  const [activeIndex, setActiveIndex] = useState<number>(startFromZero ? 0 : 1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || itemsCount === 0) return;

    const calculateActiveIndex = (): number => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Если скролла нет
      if (scrollHeight <= clientHeight) {
        return startFromZero ? 0 : 1;
      }

      // Максимальная длина скролла
      const maxScrollTop = scrollHeight - clientHeight;
      
      // Текущий процент прокрутки (0-100)
      const scrollPercent = (scrollTop / maxScrollTop) * 100;
      
      // Размер шага в процентах для каждого элемента
      const stepPercent = 100 / itemsCount;
      
      // Вычисляем индекс элемента
      // Если threshold = 35, то элемент активируется когда скролл пересекает 35% от его диапазона
      const adjustedPercent = scrollPercent + (threshold / itemsCount);
      let index = Math.floor(adjustedPercent / stepPercent);
      
      // Ограничиваем индекс
      index = Math.max(0, Math.min(index, itemsCount - 1));
      
      return startFromZero ? index : index + 1;
    };

    const handleScroll = () => {
      const newIndex = calculateActiveIndex();
      setActiveIndex(prev => prev !== newIndex ? newIndex : prev);
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Вызываем для начального состояния

    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, itemsCount, threshold, startFromZero]);

  return activeIndex;
}

export default useActiveScrollIndex;





import React, { useRef } from 'react';
import useActiveScrollIndex from './useActiveScrollIndex';

const ScrollContainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsCount = 10; // 10 элементов
  const activeIndex = useActiveScrollIndex(containerRef, {
    itemsCount,
    threshold: 35, // 35% скролла внутри элемента для активации
    startFromZero: false, // возвращаем 1,2,3... (если true то 0,1,2...)
  });

  return (
    <div>
      {/* Плашка снизу (аркана плашка) */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}
      >
        Активный элемент: {activeIndex} / {itemsCount}
      </div>

      {/* Контейнер со скроллом */}
      <div
        ref={containerRef}
        style={{
          height: '100vh',
          overflowY: 'auto',
          scrollBehavior: 'smooth',
        }}
      >
        {Array.from({ length: itemsCount }, (_, i) => (
          <div
            key={i}
            style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              backgroundColor: activeIndex === i + 1 ? '#4ecdc4' : '#f0f0f0',
              borderBottom: '1px solid #ddd',
              transition: 'background-color 0.3s',
            }}
          >
            Элемент {i + 1}
            {activeIndex === i + 1 && ' ◀ Активен'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollContainer;

