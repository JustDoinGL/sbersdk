import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './Slider.scss';

const Slider = () => {
  // Исходные данные (15 элементов)
  const allItems = [
    { id: 1, title: 'Кредитная', subtitle: 'СберКарта' },
    { id: 2, title: 'СберМаркет' },
    { id: 3, title: 'СберМобайл' },
    { id: 4, title: 'Простой клиентский путь' },
    { id: 5, title: 'Элемент 5' },
    { id: 6, title: 'Элемент 6' },
    { id: 7, title: 'Элемент 7' },
    { id: 8, title: 'Элемент 8' },
    { id: 9, title: 'Элемент 9' },
    { id: 10, title: 'Элемент 10' },
    { id: 11, title: 'Элемент 11' },
    { id: 12, title: 'Элемент 12' },
    { id: 13, title: 'Элемент 13' },
    { id: 14, title: 'Элемент 14' },
    { id: 15, title: 'Элемент 15' },
  ];

  // Настройки - можно менять
  const itemsPerGroup = 3; // Или 5 - сколько элементов показывать в одной группе

  // Разбиваем массив на группы
  const groupedItems = [];
  for (let i = 0; i < allItems.length; i += itemsPerGroup) {
    groupedItems.push(allItems.slice(i, i + itemsPerGroup));
  }

  return (
    <div className="slider">
      <div className="slider__container">
        <Splide
          options={{
            type: 'slide',
            perPage: 1,
            perMove: 1,
            gap: '16px',
            arrows: true,
            pagination: true,
            drag: true,
            breakpoints: {
              768: {
                destroy: true,
              },
            },
          }}
          className="slider__splide"
        >
          {groupedItems.map((group, index) => (
            <SplideSlide key={index} className="slider__slide">
              <div className="slider__group">
                {group.map((item) => (
                  <div key={item.id} className="slider__item">
                    <h3 className="slider__title">{item.title}</h3>
                    {item.subtitle && <p className="slider__subtitle">{item.subtitle}</p>}
                  </div>
                ))}
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
    padding: 10px 0;
  }

  &__group {
    display: grid;
    grid-template-columns: repeat(3, 1fr); // Для 3 элементов в группе
    gap: 16px;
    
    // Если нужно 5 элементов в группе, можно добавить класс или модификатор
    // Например: .slider__group--5-items { grid-template-columns: repeat(5, 1fr); }
  }

  &__item {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
    text-align: center;
  }

  &__subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
    text-align: center;
  }

  // Стили для стрелок и пагинации
  .splide__arrow {
    background: #007bff;
    
    &--prev {
      left: -1em;
    }
    
    &--next {
      right: -1em;
    }
  }
  
  .splide__pagination {
    bottom: -20px;
    
    &__page {
      background: #ccc;
      opacity: 1;
      
      &.is-active {
        background: #007bff;
      }
    }
  }
}