function mapArraysToStrings<T extends object>(obj: T): T {
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      // Преобразуем массив в строку через запятую
      result[key] = value.join(', ');
    } else if (value !== null && typeof value === 'object') {
      // Рекурсивно обрабатываем вложенные объекты
      result[key] = mapArraysToStrings(value);
    } else {
      // Копируем примитивные значения
      result[key] = value;
    }
  }
  
  return result as T;
}

// Пример использования с вашим типом данных
interface YourObjectType {
  id: number | null;
  stage: string | null;
  award: string | null;
  start_date: string[];
  end_date: string[] | null;
  insurance: number[];
  manager: string | null;
}

// Исходные данные
const originalData: YourObjectType = {
  id: null,
  stage: null,
  award: null,
  start_date: ['2024-09-22', '2025-09-22'],
  end_date: null,
  insurance: [2, 3, 4],
  manager: null
};

// Применяем маппер
const mappedData = mapArraysToStrings(originalData);

console.log(mappedData);
// Результат:
// {
//   id: null,
//   stage: null,
//   award: null,
//   start_date: "2024-09-22, 2025-09-22",
//   end_date: null,
//   insurance: "2, 3, 4",
//   manager: null
// }