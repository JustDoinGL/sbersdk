const mapFiltersToQueryParams = (filters: Record<string, any>): Record<string, string> => {
  const queryParams: Record<string, string> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return;

    const mapperConfig = FILTER_MAPPER[key as keyof typeof FILTER_MAPPER];
    
    if (!mapperConfig) {
      // Если нет маппера, используем оригинальный ключ
      if (Array.isArray(value)) {
        queryParams[key] = value.join(',');
      } else {
        queryParams[key] = value.toString();
      }
      return;
    }

    if (Array.isArray(mapperConfig)) {
      // Для дат - разбиваем по диапазону (ожидаем массив из 2 значений)
      if (Array.isArray(value) && value.length === 2) {
        const [startDate, endDate] = value;
        if (startDate) queryParams[mapperConfig[0]] = startDate;
        if (endDate) queryParams[mapperConfig[1]] = endDate;
      }
    } else if (Array.isArray(value)) {
      // Для массивов с несколькими значениями - объединяем через запятую
      queryParams[mapperConfig] = value.join(',');
    } else {
      // Для одиночных значений
      queryParams[mapperConfig] = value.toString();
    }
  });

  return queryParams;
};

// Примеры использования:

// 1. Массив с несколькими значениями
const filters1 = {
  stage: [3, 4, 5],
  insurance: [2, 7],
  award: ['212', '300']
};

const result1 = mapFiltersToQueryParams(filters1);
// Результат:
// {
//   deal_stages: "3,4,5",
//   insurance_types: "2,7",
//   award: "212,300"
// }

// 2. Одиночные значения
const filters2 = {
  stage: [3],
  insurance: [2],
  award: ['212']
};

const result2 = mapFiltersToQueryParams(filters2);
// Результат:
// {
//   deal_stages: "3",
//   insurance_types: "2",
//   award: "212"
// }

// 3. Даты (особый случай - всегда 2 значения)
const filters3 = {
  start_date: ['2024-09-22', '2025-09-22'],
  end_date: ['2025-01-01', '2025-01-18']
};

const result3 = mapFiltersToQueryParams(filters3);
// Результат:
// {
//   start_date_from: "2024-09-22",
//   start_date_to: "2025-09-22",
//   end_date_from: "2025-01-01",
//   end_date_to: "2025-01-18"
// }

// 4. Смешанный случай
const filters4 = {
  stage: [3, 4],
  insurance: [2],
  start_date: ['2024-09-22', '2025-09-22'],
  manager: ['221']
};

const result4 = mapFiltersToQueryParams(filters4);
// Результат:
// {
//   deal_stages: "3,4",
//   insurance_types: "2",
//   start_date_from: "2024-09-22",
//   start_date_to: "2025-09-22",
//   last_name: "221"
// }