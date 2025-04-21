// styles.module.scss
.slider {
  :global {
    // Контейнер пагинации
    .splide__pagination {
      position: absolute;
      bottom: -25px;
      padding: 0;
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    // Неактивные точки
    .splide__pagination__page {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #D9D9D9; // Серый цвет для неактивных
      opacity: 1;
      transition: all 0.3s ease;
      margin: 0;

      &:hover {
        background: #B5B5B5;
        transform: scale(1.1);
      }
    }

    // Активная точка
    .splide__pagination__page.is-active {
      background: #FF5722; // Оранжевый цвет для активной
      transform: scale(1.2);
    }
  }
}