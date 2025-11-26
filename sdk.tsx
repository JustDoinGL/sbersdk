function transformObjectToArray(obj) {
  const nameGroups = {};
  
  // Группируем элементы по имени
  Object.values(obj).forEach(item => {
    if (item && item.name) {
      if (!nameGroups[item.name]) {
        nameGroups[item.name] = [];
      }
      nameGroups[item.name].push(item.id);
    }
  });
  
  // Создаем результирующий массив
  const result = [];
  
  Object.values(obj).forEach(item => {
    if (item && item.name) {
      const group = nameGroups[item.name];
      
      if (group.length === 1) {
        // Если имя уникальное - используем id
        result.push({
          value: item.id.toString(),
          label: item.name
        });
      } else {
        // Если есть дубли - используем все id через запятую
        result.push({
          value: group.sort((a, b) => a - b).join(','),
          label: item.name
        });
      }
    }
  });
  
  return result;
}

// Более оптимальная версия без дубликатов в результате
function transformObjectToArrayOptimized(obj) {
  const nameMap = new Map();
  
  // Сначала собираем все данные по именам
  Object.values(obj).forEach(item => {
    if (item && item.name) {
      if (!nameMap.has(item.name)) {
        nameMap.set(item.name, []);
      }
      nameMap.get(item.name).push(item.id);
    }
  });
  
  // Создаем уникальный массив
  const result = [];
  
  nameMap.forEach((ids, name) => {
    result.push({
      value: ids.sort((a, b) => a - b).join(','),
      label: name
    });
  });
  
  return result;
}

// Использование:
const inputObject = {
  1: {id: 1, name: 'Ha cor.nacoaaHw kyparopom', additional: []},
  2: {id: 2, name: 'OrknoHeH kyparopom', additional: []},
  3: {id: 3, name: 'Ha noqnwaHwe aFeHrom', additional: []},
  4: {id: 4, name: 'OrknoHeH aFeHrom', additional: []},
  5: {id: 5, name: 'ПодnwaH aFeHrom', additional: []},
  6: {id: 6, name: 'ПодnwaH aFeHrom', additional: []},
  7: {id: 7, name: 'ПодnwaH aFeHrom', additional: []},
  8: {id: 8, name: 'OnnaHeH', additional: []}
};

// Вариант 1: Сохраняет все элементы (возможны дубли)
const result1 = transformObjectToArray(inputObject);
console.log('С дубликатами:', result1);

// Вариант 2: Только уникальные имена (рекомендуется)
const result2 = transformObjectToArrayOptimized(inputObject);
console.log('Уникальные:', result2);