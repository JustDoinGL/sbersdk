
import { useEffect, useState, RefObject, useCallback } from 'react';

interface UseActiveScrollIndexProps {
  /** Количество элементов */
  itemsCount: number;
  /** Порог срабатывания в процентах от 0 до 100 */
  threshold?: number;
  /** Начинать отсчет с 0 или с 1 */
  startFromZero?: boolean;
  /** Дебаунс для оптимизации */
  debounceMs?: number;
  /** Колбэк при смене индекса */
  onIndexChange?: (index: number) => void;
}

/**
 * Хук для определения активного элемента по горизонтальному скроллу внутри контейнера
 * @param containerRef - реф на элемент с горизонтальным скроллом
 * @param options - настройки
 * @returns индекс активного элемента
 */
function useActiveScrollIndexHorizontal(
  containerRef: RefObject<HTMLElement>,
  options: UseActiveScrollIndexProps
): number {
  const {
    itemsCount,
    threshold = 35,
    startFromZero = false,
    debounceMs = 100,
    onIndexChange,
  } = options;

  const [activeIndex, setActiveIndex] = useState<number>(startFromZero ? 0 : 1);

  const calculateActiveIndex = useCallback((): number => {
    const container = containerRef.current;
    if (!container || itemsCount === 0) {
      return startFromZero ? 0 : 1;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Если горизонтального скролла нет
    if (scrollWidth <= clientWidth) {
      return startFromZero ? 0 : 1;
    }

    // Максимальная длина горизонтального скролла
    const maxScrollLeft = scrollWidth - clientWidth;
    
    // Текущий процент горизонтальной прокрутки (0-100)
    const scrollPercent = (scrollLeft / maxScrollLeft) * 100;
    
    // Размер одного элемента в процентах
    const stepPercent = 100 / itemsCount;
    
    // Смещение порога: элемент активируется когда скролл достигает
    // определенного процента внутри его диапазона
    const thresholdOffset = (threshold / itemsCount);
    let rawPercent = scrollPercent + thresholdOffset;
    
    // Если перевалили за 100%, фиксируем последний элемент
    if (rawPercent >= 100) {
      return startFromZero ? itemsCount - 1 : itemsCount;
    }
    
    const index = Math.floor(rawPercent / stepPercent);
    const clampedIndex = Math.max(0, Math.min(index, itemsCount - 1));
    
    return startFromZero ? clampedIndex : clampedIndex + 1;
  }, [containerRef, itemsCount, threshold, startFromZero]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (debounceMs > 0) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const newIndex = calculateActiveIndex();
          setActiveIndex(prev => {
            if (prev !== newIndex) {
              onIndexChange?.(newIndex);
              return newIndex;
            }
            return prev;
          });
        }, debounceMs);
      } else {
        const newIndex = calculateActiveIndex();
        setActiveIndex(prev => {
          if (prev !== newIndex) {
            onIndexChange?.(newIndex);
            return newIndex;
          }
          return prev;
        });
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Инициализация

    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [containerRef, calculateActiveIndex, debounceMs, onIndexChange]);

  return activeIndex;
}

export default useActiveScrollIndexHorizontal;





import React, { useRef } from 'react';
import useActiveScrollIndexHorizontal from './useActiveScrollIndexHorizontal';

const HorizontalScrollDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsCount = 8;
  
  const activeIndex = useActiveScrollIndexHorizontal(containerRef, {
    itemsCount,
    threshold: 35, // 35% скролла внутри элемента для активации
    startFromZero: false, // возвращаем 1,2,3...
    onIndexChange: (index) => {
      console.log(`Активный элемент изменился на ${index}`);
    },
  });

  return (
    <div style={{ position: 'relative' }}>
      {/* Аркана плашка снизу (для горизонтального скролла можно разместить снизу или справа) */}
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
          whiteSpace: 'nowrap',
        }}
      >
        ➡️ Активный элемент: {activeIndex} / {itemsCount} ⬅️
      </div>

      {/* Контейнер с горизонтальным скроллом */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          whiteSpace: 'nowrap',
          cursor: 'grab',
        }}
      >
        <div style={{ display: 'inline-flex', gap: '20px', padding: '20px' }}>
          {Array.from({ length: itemsCount }, (_, i) => (
            <div
              key={i}
              style={{
                width: '300px',
                height: '400px',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                backgroundColor: activeIndex === i + 1 ? '#4ecdc4' : '#f0f0f0',
                borderRadius: '12px',
                border: activeIndex === i + 1 ? '3px solid #2c3e50' : '1px solid #ddd',
                transition: 'all 0.3s',
                boxShadow: activeIndex === i + 1 ? '0 4px 15px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              <div>Элемент {i + 1}</div>
              {activeIndex === i + 1 && (
                <div style={{ fontSize: '14px', marginTop: '10px' }}>✅ Активен</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HorizontalScrollDemo;

