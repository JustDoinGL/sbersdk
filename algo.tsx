/*
Смерджить два массива с покупками. 
Массивы приходят на вход всегда отсортированными по id. 
У каждой покупки свой уникальной id (для бананов это 1, для апельсинов 2 и т.д.) .
Нужно на выходе получить массив уникальных отсортированных по id покупок, с минимальной ценой.
Сложность по времени не должна быть больше O(n)
*/

const merge = (arr1, arr2) => {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < arr1.length && j < arr2.length) {
    if (arr1[i].id < arr2[j].id) {
      result.push(arr1[i]);
      i++;
    } else if (arr1[i].id > arr2[j].id) {
      result.push(arr2[j]);
      j++;
    } else {
      // Если id одинаковые, выбираем с минимальной ценой
      const minPriceItem = arr1[i].price < arr2[j].price ? arr1[i] : arr2[j];
      result.push(minPriceItem);
      i++;
      j++;
    }
  }

  // Добавляем оставшиеся элементы из arr1
  while (i < arr1.length) {
    result.push(arr1[i]);
    i++;
  }

  // Добавляем оставшиеся элементы из arr2
  while (j < arr2.length) {
    result.push(arr2[j]);
    j++;
  }

  return result;
};

const purchases1 = [
  { id: 1, title: "бананы", price: 100 },
  { id: 2, title: "апельсины", price: 500 },
  { id: 3, title: "мандарины", price: 500 },
  { id: 3, title: "мандарины", price: 100 },
  { id: 4, title: "ананасы", price: 500 },
  { id: 5, title: "яблоки", price: 500 },
  { id: 6, title: "груши", price: 500 },
  { id: 8, title: "киви", price: 800 },
  { id: 9, title: "манго", price: 900 },
];

const purchases2 = [
  { id: 1, title: "бананы", price: 600 },
  { id: 1, title: "бананы", price: 700 },
  { id: 3, title: "мандарины", price: 100 },
  { id: 3, title: "мандарины", price: 500 },
  { id: 4, title: "ананасы", price: 500 },
  { id: 6, title: "груши", price: 50 },
  { id: 6, title: "груши", price: 1000 },
  { id: 7, title: "черешня", price: 1000 },
];

console.log(merge(purchases1, purchases2));

// [
//     { id: 1, title: 'бананы', price: 100},
//     { id: 2, title: 'апельсины', price: 500},
//     { id: 3, title: 'мандарины', price: 100},
//     { id: 4, title: 'ананасы', price: 500},
//     { id: 5, title: 'яблоки', price: 500},
//     { id: 6, title: 'груши', price: 50},
//     { id: 7, title: 'черешня', price: 1000},
//     { id: 8, title: 'киви', price: 800},
//     { id: 9, title: 'манго', price: 900},
// ]

