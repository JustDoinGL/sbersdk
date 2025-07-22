useMotionValueEvent(scrollY, 'change', (latestY) => {
  if (!swiperRef.current) return;

  const swiper = swiperRef.current;
  const direction = latestY > 0 ? 'down' : 'up';

  if (direction === 'down' && !swiper.isEnd) {
    // Скролл вниз - двигаем к концу
    swiper.slideNext();
    
    // Если достигли конца
    if (swiper.isEnd) {
      console.log('Конец достигнут!');
      // Можно добавить эффект "отскока" или другую логику
    }
  } 
  else if (direction === 'up' && !swiper.isBeginning) {
    // Скролл вверх - двигаем к началу
    swiper.slidePrev();
    
    // Если достигли начала
    if (swiper.isBeginning) {
      console.log('Начало достигнуто!');
      // Дополнительные действия
    }
  }
});