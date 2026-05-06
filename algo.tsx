const setActiveIndexByScroll = useCallback((index: number) => {
  const container = containerRef.current;
  if (!container || itemsCount === 0) return;

  // Приводим индекс к корректному диапазону
  const rawIndex = startFromZero ? index : index - 1;
  const clampedIndex = Math.max(0, Math.min(rawIndex, itemsCount - 1));

  // Процент прокрутки для этого элемента
  const stepPercent = 100 / itemsCount;
  const targetPercent = clampedIndex * stepPercent;

  // Корректировка с учетом порога (чтобы элемент стал активным сразу после докрутки)
  const thresholdOffset = (threshold / itemsCount) * stepPercent;
  let adjustedPercent = targetPercent;

  if (threshold > 0) {
    // Если не последний элемент — докручиваем до начала диапазона элемента
    if (clampedIndex < itemsCount - 1) {
      adjustedPercent = targetPercent;
    } else {
      // Последний элемент — докручиваем до конца
      adjustedPercent = Math.min(100, targetPercent + thresholdOffset);
    }
  }

  // Преобразуем процент обратно в scrollLeft
  const { scrollWidth, clientWidth } = container;
  const maxScrollLeft = scrollWidth - clientWidth;
  const targetScrollLeft = (adjustedPercent / 100) * maxScrollLeft;

  // Плавная прокрутка
  container.scrollTo({
    left: targetScrollLeft,
    behavior: 'smooth',
  });

  // Обновляем состояние (вызовется onIndexChange)
  setActiveIndex(clampedIndex);
}, [containerRef, itemsCount, threshold, startFromZero]);

return { activeIndex, setActiveIndexByScroll };