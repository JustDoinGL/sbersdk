import { useState, useRef, useCallback, useEffect } from 'react';

export function useScrollVisibility() {
  const [states, setStates] = useState({
    isBlockVisible: false,
    isContainerVisible: true, // По умолчанию true для случаев без контейнера
    showFilters: false,
    showResetButton: false
  });

  const observers = useRef({
    block: null as IntersectionObserver | null,
    container: null as IntersectionObserver | null
  });

  const elements = useRef({
    block: null as HTMLElement | null,
    container: null as HTMLElement | null
  });

  const scrollData = useRef({
    lastY: 0,
    isDown: false
  });

  // Функция для обновления состояний с логированием
  const updateState = useCallback((newState: Partial<typeof states>) => {
    setStates(prev => {
      const updated = { ...prev, ...newState };
      console.log('State updated:', updated);
      return updated;
    });
  }, []);

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    const isDown = currentY > scrollData.current.lastY;
    scrollData.current = { lastY: currentY, isDown };

    updateState({
      showFilters: states.isContainerVisible && 
                 !states.isBlockVisible && 
                 isDown
    });
  }, [states.isContainerVisible, states.isBlockVisible, updateState]);

  const setupObserver = useCallback((type: 'block' | 'container') => {
    const element = elements.current[type];
    if (!element) return;

    observers.current[type]?.disconnect();

    const observer = new IntersectionObserver(([entry]) => {
      if (type === 'block') {
        updateState({ 
          isBlockVisible: entry.isIntersecting,
          showFilters: entry.isIntersecting ? false : states.showFilters
        });
      } else {
        updateState({ 
          isContainerVisible: entry.isIntersecting,
          ...(!entry.isIntersecting && { 
            isBlockVisible: false,
            showFilters: false 
          })
        });
      }
    }, { threshold: type === 'container' ? 0 : 0.1 });

    observer.observe(element);
    observers.current[type] = observer;
  }, [updateState, states.showFilters]);

  const blockRef = useCallback((node: HTMLElement | null) => {
    elements.current.block = node;
    if (node) setupObserver('block');
    else updateState({ isBlockVisible: false, showFilters: false });
  }, [setupObserver, updateState]);

  const containerRef = useCallback((node: HTMLElement | null) => {
    elements.current.container = node;
    if (node) setupObserver('container');
    else updateState({ isContainerVisible: true });
  }, [setupObserver, updateState]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observers.current.block?.disconnect();
      observers.current.container?.disconnect();
    };
  }, [handleScroll]);

  return {
    blockRef,
    containerRef,
    showFilters: states.showFilters,
    showResetButton: states.isContainerVisible && !states.isBlockVisible,
    debugStates: states // Для отладки
  };
}