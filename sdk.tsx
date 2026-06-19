
import { RefObject, useEffect, useState, useRef, useCallback } from 'react';

type TSliderPosition = {
    leftOffset: number;
    width: number;
};

const useSlider = (checked: number, tabList: RefObject<HTMLDivElement>) => {
    const [slider, setSlider] = useState<TSliderPosition>({ leftOffset: 0, width: 0 });
    const [isRendered, setIsRendered] = useState(false);

    const checkedRef = useRef<number | null>(null);
    const isRenderedRef = useRef<boolean>(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

    // Функция для позиционирования слайдера
    const repositionSlider = useCallback(() => {
        if (checkedRef.current === null || !tabList.current) {
            return;
        }

        const container = tabList.current;
        const node = container.querySelector<HTMLButtonElement>(
            `button[data-value="${checkedRef.current}"]`
        );

        if (!node) return;

        const nodeRect = node.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const nodeWidth = node.clientWidth;

        // Устанавливаем позицию слайдера
        setSlider({
            leftOffset: node.offsetLeft || 0,
            width: nodeWidth || 0
        });

        // Логика скролла
        const containerScrollLeft = container.scrollLeft;
        const nodeOffsetLeft = node.offsetLeft;
        const nodeOffsetRight = nodeOffsetLeft + nodeWidth;

        // Для первого элемента — скроллим к началу
        const isFirst = node === container.querySelector('button:first-child');
        // Для последнего элемента — скроллим к концу
        const isLast = node === container.querySelector('button:last-child');

        if (isFirst) {
            container.scrollTo({
                behavior: 'smooth',
                left: 0
            });
            return;
        }

        if (isLast) {
            container.scrollTo({
                behavior: 'smooth',
                left: container.scrollWidth - container.clientWidth
            });
            return;
        }

        // Проверяем видимость элемента
        const isFullyVisible = 
            nodeOffsetLeft >= containerScrollLeft && 
            nodeOffsetRight <= containerScrollLeft + container.clientWidth;

        if (!isFullyVisible) {
            // Скроллим так, чтобы активный элемент был виден полностью
            // и показывал часть следующего элемента (примерно 20% от ширины)
            const nextElement = node.nextElementSibling as HTMLElement;
            const nextWidth = nextElement ? nextElement.clientWidth : 0;
            const targetScroll = nodeOffsetLeft - (container.clientWidth - nodeWidth - nextWidth * 0.2);

            container.scrollTo({
                behavior: 'smooth',
                left: Math.max(0, targetScroll)
            });
        }
    }, []);

    // Функция для обновления слайдера с debounce
    const updateSlider = useCallback(() => {
        setIsRendered(true);
        
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            repositionSlider();
        }, 100);
    }, [repositionSlider]);

    // Обработчик изменения размера
    useEffect(() => {
        const onResize = () => {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                repositionSlider();
            }, 500);
        };

        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('orientationchange', onResize);
            clearTimeout(debounceTimer.current);
        };
    }, [repositionSlider]);

    // Обработчик изменения checked
    useEffect(() => {
        checkedRef.current = checked;
        isRenderedRef.current = true;
        
        // Немного задерживаем для корректного рендера
        const timer = setTimeout(() => {
            repositionSlider();
        }, 50);

        return () => clearTimeout(timer);
    }, [checked, repositionSlider]);

    return {
        isRendered,
        sliderLeftOffset: slider.leftOffset,
        sliderWidth: slider.width
    };
};

export default useSlider;