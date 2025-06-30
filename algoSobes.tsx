const merge = (arr1, arr2) => {
  const result = [];
  const map = {};
  
  // Обрабатываем оба массива
  let i = 0, j = 0;
  while (i < arr1.length && j < arr2.length) {
    if (arr1[i].id <= arr2[j].id) {
      processElement(arr1[i], map, result);
      i++;
    } else {
      processElement(arr2[j], map, result);
      j++;
    }
  }
  
  // Обрабатываем оставшиеся элементы в arr1
  while (i < arr1.length) {
    processElement(arr1[i], map, result);
    i++;
  }
  
  // Обрабатываем оставшиеся элементы в arr2
  while (j < arr2.length) {
    processElement(arr2[j], map, result);
    j++;
  }
  
  return result;
}

// Вспомогательная функция для обработки элемента
function processElement(el, map, result) {
  if (!map[el.id]) {
    // Если элемент с таким id еще не встречался, добавляем его
    map[el.id] = el;
    result.push(el);
  } else if (map[el.id].price > el.price) {
    // Если нашли элемент с меньшей ценой, обновляем
    map[el.id].price = el.price;
  }
}

const purchases1 = [
    { id: 1, title: 'бананы', price: 100},
    { id: 2, title: 'апельсины', price: 500},
    { id: 3, title: 'мандарины', price: 500},
    { id: 3, title: 'мандарины', price: 100},
    { id: 4, title: 'ананасы', price: 500},
    { id: 5, title: 'яблоки', price: 500},
    { id: 6, title: 'груши', price: 500},
    { id: 8, title: 'киви', price: 800},
    { id: 9, title: 'манго', price: 900},
]

const purchases2 = [
    { id: 1, title: 'бананы', price: 600},
    { id: 1, title: 'бананы', price: 700},
    { id: 3, title: 'мандарины', price: 100},
    { id: 3, title: 'мандарины', price: 500},
    { id: 4, title: 'ананасы', price: 500},
    { id: 6, title: 'груши', price: 50},
    { id: 6, title: 'груши', price: 1000},
    { id: 7, title: 'черешня', price: 1000},
]

console.log(merge(purchases1, purchases2))