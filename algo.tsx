const setActiveIndexByScroll = useCallback((index: number) => {
  const container = containerRef.current;
  if (!container || itemsCount === 0) return;

  // Приводим индекс к корректному диапазону
  const rawIndex = startFromZero ? index : index - 1;
  const clampedIndex = Math.max(0, Math.min(rawIndex, itemsCount - 1));

  // Получаем все дочерние элементы контейнера (предполагается, что каждый элемент — это отдельный ребенок)
  const children = Array.from(container.children) as HTMLElement[];
  if (children.length === 0) return;

  // Получаем позицию целевого элемента относительно контейнера
  const targetChild = children[clampedIndex];
  if (!targetChild) return;

  // Получаем позицию элемента с учетом его отступов/рамок
  const containerRect = container.getBoundingClientRect();
  const childRect = targetChild.getBoundingClientRect();
  
  // Сколько нужно прокрутить, чтобы элемент оказался у левого края контейнера
  let targetScrollLeft = container.scrollLeft + (childRect.left - containerRect.left);

  // Учет порога: если нужно, чтобы элемент активировался не строго у края,
  // а когда он занимает определенный процент видимой области
  if (threshold > 0) {
    const childWidth = childRect.width;
    const containerWidth = containerRect.width;
    const thresholdPx = (threshold / 100) * containerWidth;
    
    // Корректируем позицию, чтобы элемент "въехал" на threshold процентов
    targetScrollLeft = container.scrollLeft + (childRect.left - containerRect.left) - thresholdPx;
  }

  // Ограничиваем прокрутку допустимыми пределами
  const maxScrollLeft = container.scrollWidth - container.clientWidth;
  targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));

  // Выполняем прокрутку
  container.scrollTo({
    left: targetScrollLeft,
    behavior: 'smooth',
  });

  // Обновляем состояние (колбэк сработает через handleScroll)
  setActiveIndex(clampedIndex);
}, [containerRef, itemsCount, threshold, startFromZero]);