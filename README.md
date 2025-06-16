.img-container {
  width: 400px;  /* Ширина контейнера (можно в %) */
  aspect-ratio: 4 / 3;  /* Соотношение 4:3 */
  overflow: hidden;  /* Обрезаем всё, что выходит за границы */
}

.img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;  /* Заполняет контейнер с обрезкой */
  object-position: left;  /* Обрезает справа, оставляя левую часть */
}