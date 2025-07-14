const onScroll = () => {
  if (!wrapperRef.current || !slides.length) return;
  
  const startIndex = getViewportStartSlide(slides);

  // Блокировка скролла при достижении определенного слайда
  if (startIndex === 2) {
    // 1. Запрещаем скролл через CSS
    wrapperRef.current.style.overflow = 'hidden';
    
    // 2. Принудительно возвращаем на блокирующий слайд
    wrapperRef.current.scrollTop = slides[2].offsetTop;
    
    // 3. Добавляем обработчики для блокировки других способов скролла
    const preventDefault = (e: Event) => e.preventDefault();
    
    // Блокировка колеса мыши
    wrapperRef.current.addEventListener('wheel', preventDefault, { passive: false });
    
    // Блокировка touch-событий (для мобильных устройств)
    wrapperRef.current.addEventListener('touchmove', preventDefault, { passive: false });
    
    // Обновляем состояние
    setActiveIndex(2);
    
    // Очистка обработчиков при размонтировании или уходе со слайда
    return () => {
      wrapperRef.current?.removeEventListener('wheel', preventDefault);
      wrapperRef.current?.removeEventListener('touchmove', preventDefault);
    };
  }

  // Остальная логика обработки скролла...
};