import { useMotionValueEvent, useScroll } from 'framer-motion';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { selectCurrentScrollDirection } from '../../features/activityWidget/sliceCreators/selectors';
import { useSelector } from 'react-redux';

// Типы для пропсов
type TArgs = {
    swiperRef: React.MutableRefObject<any>; // Реф на Swiper компонент
    containerRef: React.RefObject<HTMLElement>; // Реф на контейнер для скролла
};

type TUseScrollVerticalHorizontal = (args: TArgs) => void;

/**
 * Хук для синхронизации вертикального скролла с горизонтальным перемещением Swiper
 * При скролле вниз - двигаем Swiper влево, при скролле вверх - вправо
 * Также обрабатывает граничные состояния (начало и конец скролла)
 */
export const useScrollVerticalHorizontal: TUseScrollVerticalHorizontal = ({
    swiperRef,
    containerRef
}) => {
    // Максимальное значение скролла (ширина всех слайдов минус видимая область)
    const [maxScroll, setMaxScroll] = useState(0);
    
    // Флаг для избежания рекурсивных обновлений
    const isScrolling = useRef(false);
    
    // Направление скролла из Redux хранилища ('up' или 'down')
    const scrollDirection = useSelector(selectCurrentScrollDirection);
    
    // Флаги достижения границ
    const reachedEnd = useRef(false); // Достигнут конец
    const reachedStart = useRef(true); // Достигнуто начало

    // Получаем значения скролла из Framer Motion
    const { scrollY, scrollX } = useScroll({
        container: containerRef
    });

    /**
     * Эффект для расчета максимального значения скролла
     * Вызывается при изменении размеров контейнера или слайдов
     */
    useEffect(() => {
        if (!swiperRef.current) return;

        const updateMaxScroll = () => {
            if (!swiperRef.current) return;

            const swiper = swiperRef.current;
            // Суммируем ширину всех слайдов
            const totalWidth = swiper.slides.reduce(
                (sum: number, slide: { swiperSlideSize: number }) =>
                    sum + slide.swiperSlideSize + swiper.params.spaceBetween,
                0
            );

            // Макс. скролл = общая ширина - видимая область + отступы
            const newMaxScroll = Math.max(0, totalWidth - swiper.width + swiper.params.spaceBetween);
            setMaxScroll(newMaxScroll);
            
            // Проверяем текущее положение
            const currentTranslate = Math.abs(swiper.getTranslate());
            reachedEnd.current = currentTranslate >= newMaxScroll - 1;
            reachedStart.current = currentTranslate <= 1;
        };

        updateMaxScroll();
        // Наблюдаем за изменениями размеров
        const observer = new ResizeObserver(updateMaxScroll);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [containerRef, swiperRef]);

    /**
     * Обработчик вертикального скролла
     * Преобразует вертикальный скролл в горизонтальное перемещение Swiper
     */
    useMotionValueEvent(scrollY, 'change', (latestY) => {
        if (!swiperRef.current || isScrolling.current) return;

        isScrolling.current = true;
        const currentTranslate = Math.abs(swiperRef.current.getTranslate());
        
        let newTranslate;
        if (scrollDirection === 'down') {
            // При скролле ВНИЗ - двигаемся ВЛЕВО (увеличиваем translate)
            newTranslate = Math.min(maxScroll, currentTranslate + latestY * 0.5);
        } else {
            // При скролле ВВЕРХ - двигаемся ВПРАВО (уменьшаем translate)
            newTranslate = Math.max(0, currentTranslate - latestY * 0.5);
        }

        // Проверка граничных состояний
        if (newTranslate <= 0) {
            reachedStart.current = true;
            // Здесь можно добавить эффект при достижении начала
            console.log('Достигнуто начало!');
        } else if (newTranslate >= maxScroll) {
            reachedEnd.current = true;
            // Здесь можно добавить эффект при достижении конца
            console.log('Достигнут конец!');
        } else {
            reachedStart.current = false;
            reachedEnd.current = false;
        }

        // Применяем новое положение
        swiperRef.current.setTranslate(-newTranslate);

        // Сбрасываем флаг блокировки
        requestAnimationFrame(() => {
            isScrolling.current = false;
        });
    });

    /**
     * Обработчик колесика мыши для прямого горизонтального скролла
     */
    useEffect(() => {
        const swiperEl = containerRef.current;
        if (!swiperEl) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (!swiperRef.current || isScrolling.current) return;

            const deltaX = e.deltaX || 0; // Горизонтальное движение колесика
            const deltaY = e.deltaY || 0; // Вертикальное движение колесика
            
            // Комбинируем оба направления с приоритетом горизонтального
            const delta = deltaX + deltaY * 0.5;

            const currentTranslate = Math.abs(swiperRef.current.getTranslate());
            const newTranslate = Math.max(0, Math.min(maxScroll, currentTranslate + delta));

            swiperRef.current.setTranslate(-newTranslate);
        };

        swiperEl.addEventListener('wheel', handleWheel, { passive: false });
        return () => swiperEl.removeEventListener('wheel', handleWheel);
    }, [containerRef, maxScroll, swiperRef]);
};