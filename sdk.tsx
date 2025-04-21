import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './Slider.scss';

const Slider = () => {
  const slides = [
    { id: 1, title: 'Кредитная', subtitle: 'СберКарта' },
    { id: 2, title: 'СберМаркет' },
    { id: 3, title: 'СберМобайл' },
    { id: 4, title: 'Простой клиентский путь' },
    { id: 5, title: 'Дополнительный элемент 1' },
    { id: 6, title: 'Дополнительный элемент 2' },
    { id: 7, title: 'Дополнительный элемент 3' },
    { id: 8, title: 'Дополнительный элемент 4' },
    { id: 9, title: 'Дополнительный элемент 5' },
  ];

  return (
    <div className="slider">
      <div className="slider__container">
        <Splide
          options={{
            type: 'slide',
            perPage: 3,
            perMove: 1,
            gap: '16px',
            arrows: false,
            pagination: false,
            drag: true, // Включаем возможность свайпа
            snap: true,
            breakpoints: {
              768: {
                destroy: true,
              },
              480: {
                perPage: 2, // На очень маленьких экранах показываем по 2 элемента
              },
            },
          }}
          className="slider__splide"
        >
          {slides.map((slide) => (
            <SplideSlide key={slide.id} className="slider__slide">
              <div className="slider__content">
                <h3 className="slider__title">{slide.title}</h3>
                {slide.subtitle && <p className="slider__subtitle">{slide.subtitle}</p>}
              </div>
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </div>
  );
};

export default Slider;

.slider {
  &__container {
    max-width: 100%;
    margin: 0 auto;
    padding: 0 16px;
  }

  &__splide {
    display: block;

    @media (min-width: 768px) {
      display: none;
    }
  }

  &__slide {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 8px;
  }

  &__content {
    text-align: center;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }

  &__subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}