import React, { useState, useRef, useCallback, useEffect } from 'react';
import cx from 'classnames';

// Интерфейс пропсов компонента
interface SlideScrollerProps {
  children: React.ReactNode; // Дочерние элементы (слайды)
  segment?: string; // Сегмент для аналитики (не используется в текущей логике)
  zoomFactor?: number; // Коэффициент масштабирования при скролле (по умолчанию 0.3)
  className?: string; // Дополнительные CSS-классы
  style?: React.CSSProperties; // Дополнительные стили
}

const SlideScroller: React.FC<SlideScrollerProps> = ({
  children,
  segment,
  zoomFactor = 0.3,
  className,
  style,
}) => {
  // Рефы для DOM-элементов
  const wrapperRef = useRef<HTMLDivElement | null>(null); // Контейнер скроллера
  const controlRef = useRef<HTMLDivElement | null>(null); // Контейнер контролов (точек навигации)
  const currentSlideRef = useRef<number>(0); // Текущий слайд (для внутреннего использования)
  const lastScrollTop = useRef<number>(0); // Последняя позиция скролла (для определения направления)
  
  // Состояния компонента
  const [height, setHeight] = useState<number>(0); // Высота контейнера
  const [isShowAnimate, setIsShowAnimate] = useState<boolean>(false); // Флаг анимации
  const [activeIndex, setActiveIndex] = useState<number>(0); // Индекс активного слайда
  const [scrollComponents, setScrollComponents] = useState<{
    slides: HTMLElement[]; // Массив DOM-элементов слайдов
    onScroll: () => void; // Функция обработки скролла
  }>({
    slides: [],
    onScroll: () => {},
  });

  // Преобразуем children в массив с сохранением ссылок
  const childrenWithRefs = React.Children.toArray(children);

  // Обработчик клика по контролу (точке навигации)
  const onSlideClick = (index: number) => {
    // Плавный скролл к выбранному слайду
    scrollComponents.slides[index]?.scrollIntoView({ behavior: 'smooth' });
    
    // Отправка события в аналитику
    dataLayerPush({
      action: 'click_in_scroll_line',
      label: 'left_page_scroll_line_with_points'
    });
  };

  // Определение первого видимого слайда в viewport
  const getViewportStartSlide = (slides: HTMLElement[]) => {
    if (!wrapperRef.current) return 0;
    
    let startIndex = 0;
    // Идем с конца, чтобы найти первый слайд, верх которого выше верха viewport
    for (let i = slides.length - 1; i > 0; i--) {
      if (wrapperRef.current.scrollTop >= slides[i].offsetTop) {
        startIndex = i;
        break;
      }
    }
    return startIndex;
  };

  // Создание объектов слайдов и функции скролла (мемоизировано)
  const getScrollComponents = useCallback(() => {
    if (!wrapperRef.current) return { slides: [], onScroll: () => {} };

    // Находим все секции (слайды) внутри контейнера
    const slides = Array.from(wrapperRef.current.querySelectorAll('section'));

    // Функция обработки скролла
    const onScroll = () => {
      if (!wrapperRef.current || !slides.length) return;
      if (wrapperRef.current.scrollTop < 0) return; // Игнорируем скролл выше начала

      const startIndex = getViewportStartSlide(slides);
      
      // Обновляем активный индекс если он изменился
      if (controlRef.current && currentSlideRef.current !== startIndex) {
        currentSlideRef.current = startIndex;
        setActiveIndex(startIndex);
      }

      // Анимации выполняем в requestAnimationFrame для плавности
      requestAnimationFrame(() => {
        // Обрабатываем текущий и следующий слайд
        for (let i = startIndex; i <= startIndex + 1; i++) {
          if (!slides[i]) continue;
          
          // Вычисляем "дельту" - прогресс прокрутки между слайдами (0-1)
          const delta = Math.min(
            1,
            Math.abs(wrapperRef.current!.scrollTop - slides[i].offsetTop) / 
            slides[i].clientHeight
          );

          // Применяем масштабирование к основному содержимому слайда
          if (slides[i] !== slides[slides.length - 1]) {
            slides[i].firstElementChild?.setAttribute(
              'style', 
              `transform: scale(${1 - delta * zoomFactor})`
            );
          }

          // Разная логика для скролла вниз и вверх
          if (wrapperRef.current!.scrollTop > lastScrollTop.current) {
            // Скролл вниз - уменьшаем opacity у следующих элементов
            if (slides[i].firstElementChild?.nextElementSibling) {
              slides[i].firstElementChild?.nextElementSibling?.setAttribute(
                'style',
                `opacity: ${1 - delta}`
              );
              slides[i].firstElementChild?.nextElementSibling?.classList.remove(
                cx('fade-in')
              );
            }
          } else if (wrapperRef.current!.scrollTop < lastScrollTop.current) {
            // Скролл вверх - добавляем класс анимации появления
            slides[i].firstElementChild?.nextElementSibling?.classList.add(
              cx('fade-in')
            );
          }
        }

        // Сохраняем текущую позицию скролла
        lastScrollTop.current = wrapperRef.current.scrollTop <= 0 
          ? 0 
          : wrapperRef.current.scrollTop;
      });
    };

    return { slides, onScroll };
  }, [zoomFactor]);

  // Эффект инициализации скролла
  useEffect(() => {
    const { slides, onScroll } = getScrollComponents();
    let timeoutID: NodeJS.Timeout;

    if (wrapperRef.current) {
      // Удаляем предыдущий обработчик скролла, если был
      if (scrollComponents.onScroll) {
        wrapperRef.current.removeEventListener('scroll', scrollComponents.onScroll);
      }

      // Плавно скроллим к первому слайду при инициализации
      slides[0]?.scrollIntoView({ behavior: 'smooth' });

      // Сохраняем слайды и обработчик в состоянии
      setScrollComponents({ slides, onScroll });

      // Инициализируем позицию после небольшой задержки
      timeoutID = setTimeout(() => {
        onScroll();
      }, 100);

      // Добавляем обработчик скролла
      wrapperRef.current.addEventListener('scroll', onScroll);
    }

    // Очистка при размонтировании
    return () => {
      clearTimeout(timeoutID);
      if (wrapperRef.current && scrollComponents.onScroll) {
        wrapperRef.current.removeEventListener('scroll', scrollComponents.onScroll);
      }
    };
  }, [getScrollComponents, scrollComponents.onScroll]);

  // Эффект для показа начальной анимации
  useEffect(() => {
    setIsShowAnimate(true);
    const timeoutID = setTimeout(() => {
      setIsShowAnimate(false);
    }, 1000);
    
    return () => clearTimeout(timeoutID);
  }, []);

  // Рендер компонента
  return (
    <div
      className={cx('slide-scroller', className)}
      style={{ height, ...style }}
      ref={wrapperRef}
      id="slide-scroller"
    >
      {/* Контролы (точки навигации) */}
      <div className={cx('slide-scroller__control')} ref={controlRef}>
        {scrollComponents.slides.map((_slide, i) => (
          <button
            className={cx(
              'slide-scroller__control-btn',
              activeIndex === i && 'slide-scroller__control-btn--active'
            )}
            onClick={() => onSlideClick(i)}
            key={`control-btn-${i}`}
            type="button"
          />
        ))}
      </div>
      
      {/* Анимированный элемент (например, указатель мыши) */}
      <div className={cx(
        'slide-scroller__mouse',
        activeIndex === 0 && 'slide-scroller__fade-out',
        activeIndex !== 0 && 'slide-scroller__fade-exit'
      )} />

      {/* Рендер слайдов */}
      {childrenWithRefs.map((item, index) => (
        <section
          className={cx(
            'slide-scroller__content',
            activeIndex === index && 'slide-scroller__content--active'
          )}
          key={`slide-${index}`}
        >
          {item}
        </section>
      ))}
    </div>
  );
};

export default SlideScroller;