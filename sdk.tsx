const useSlider = (checked: number, tabList: RefObject<HTMLDivElement>) => {
    const onRepositionSlider = () => {
        if (checkedRef.current === null) {
            return;
        }

        const node = tabList?.current?.querySelector(`button[data-value="${checkedRef.current}"]`);
        const container = tabList.current;

        if (node && container) {
            const containerRect = container.getBoundingClientRect();
            const nodeRect = node.getBoundingClientRect();
            
            // Вычисляем позицию скролла относительно контейнера
            const nodeOffsetLeft = node.offsetLeft;
            const nodeWidth = node.clientWidth;
            const containerWidth = container.clientWidth;
            const containerScrollLeft = container.scrollLeft;
            
            // Определяем целевое положение скролла
            let targetScroll = containerScrollLeft;
            
            // Проверяем, виден ли элемент полностью
            const isFullyVisible = 
                nodeRect.left >= containerRect.left && 
                nodeRect.right <= containerRect.right;
            
            // Если элемент не виден полностью или частично виден
            if (!isFullyVisible) {
                // Если элемент слева от видимой области
                if (nodeRect.left < containerRect.left) {
                    targetScroll = nodeOffsetLeft - 16; // небольшой отступ слева
                } 
                // Если элемент справа от видимой области
                else if (nodeRect.right > containerRect.right) {
                    targetScroll = nodeOffsetLeft - containerWidth + nodeWidth + 16; // отступ справа
                }
                // Если элемент частично виден
                else {
                    // Центрируем элемент
                    targetScroll = nodeOffsetLeft - (containerWidth / 2) + (nodeWidth / 2);
                }
            } else {
                // Если элемент полностью виден, но нужно его показать полностью
                // Для первого элемента - скроллим к началу
                if (checkedRef.current === 0) {
                    targetScroll = 0;
                } 
                // Для последнего - скроллим к концу
                else {
                    const allButtons = container.querySelectorAll('button[data-value]');
                    const lastValue = Number(allButtons[allButtons.length - 1]?.getAttribute('data-value'));
                    
                    if (checkedRef.current === lastValue) {
                        targetScroll = container.scrollWidth - containerWidth;
                    } else {
                        // Для остальных центрируем
                        targetScroll = nodeOffsetLeft - (containerWidth / 2) + (nodeWidth / 2);
                    }
                }
            }
            
            // Применяем скролл с ограничениями
            const maxScroll = container.scrollWidth - containerWidth;
            targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
            
            container.scrollTo({
                behavior: 'smooth',
                left: targetScroll
            });
        }

        // Обновляем слайдер
        if (node) {
            const w = node.clientWidth;
            setSlider({
                leftOffset: (node as HTMLElement).offsetLeft || 0,
                width: w || 0
            });
        }
    };

    useEffect(() => {
        setIsRendered(true);

        const onResize = () => {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                onRepositionSlider();
            }, 500);
        };

        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('orientationchange', onResize);
            clearTimeout(debounceTimer.current);
        };
    }, []);

    useEffect(() => {
        checkedRef.current = checked;
        // Используем requestAnimationFrame для гарантии, что DOM обновился
        requestAnimationFrame(() => {
            onRepositionSlider();
        });
        isRenderedRef.current = true;
    }, [checked]);

    return {
        // ... return values
    };
};