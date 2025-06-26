/*
Смерджить два массива с покупками. 
Массивы приходят на вход всегда отсортированными по id. 
У каждой покупки свой уникальной id (для бананов это 1, для апельсинов 2 и т.д.) .
Нужно на выходе получить массив уникальных отсортированных по id покупок, с минимальной ценой.
Сложность по времени не должна быть больше O(n)
*/



const merge = (arr1, arr2) => {
  const mapa = []
  const arr = [...purchases1, ...purchases2]

  arr.forEach((el) => {
    // if (mapa[el.id]) {
      
    //   if (mapa[el.id].price > el.price) {
    //     mapa[el.id] = el
    //   }
    // } else {
    //   mapa[el.id] = el
    // }

    if (mapa[el.id]) {
      if ( mapa[el.id].price > el.price) {
        mapa[el.id] = el
      }
      
    } else {
       mapa[el.id] = el
    }
  })

  

    
  return mapa.filter((el) => el)
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
/*
[
    { id: 1, title: 'бананы', price: 100},
    { id: 2, title: 'апельсины', price: 500},
    { id: 3, title: 'мандарины', price: 100},
    { id: 4, title: 'ананасы', price: 500},
    { id: 5, title: 'яблоки', price: 500},
    { id: 6, title: 'груши', price: 50},
    { id: 7, title: 'черешня', price: 1000},
    { id: 8, title: 'киви', price: 800},
    { id: 9, title: 'манго', price: 900},
]
*/