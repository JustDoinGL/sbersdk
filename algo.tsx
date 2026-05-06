const scrollToIndex = useCallback((index: number) => {
  const container = containerRef.current;
  if (!container || itemsCount === 0) return;

  // Нормализуем индекс в зависимости от startFromZero
  const normalizedIndex = startFromZero ? index : index - 1;
  
  // Проверяем границы
  if (normalizedIndex < 0 || normalizedIndex >= itemsCount) return;

  const { scrollWidth, clientWidth } = container;
  
  // Если скролла нет, ничего не делаем
  if (scrollWidth <= clientWidth) return;

  // Вычисляем ширину одного элемента
  const itemWidth = scrollWidth / itemsCount;
  
  let targetScrollLeft: number;

  // Первый элемент — скроллим к началу
  if (normalizedIndex === 0) {
    targetScrollLeft = 0;
  } 
  // Последний элемент — скроллим к концу
  else if (normalizedIndex === itemsCount - 1) {
    targetScrollLeft = scrollWidth - clientWidth;
  } 
  // Остальные элементы — центрируем или показываем с учетом отступов
  else {
    // Центр элемента
    const elementCenter = normalizedIndex * itemWidth + itemWidth / 2;
    // Центр контейнера
    targetScrollLeft = elementCenter - clientWidth / 2;
  }

  // Убеждаемся, что не выходим за границы
  const maxScrollLeft = scrollWidth - clientWidth;
  targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));

  // Плавная прокрутка
  container.scrollTo({
    left: targetScrollLeft,
    behavior: 'smooth'
  });
}, [containerRef, itemsCount, startFromZero]);