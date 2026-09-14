// ==========================================
// 1. БАЗОВЫЕ ТИПЫ И СЛОВАРИ
// ==========================================

// Базовый тип для словаря (справочника)
export type Dictionary = {
  label: string;
  value: string | number;
};

// Тип для продукта "accidents" (как у тебя на скрине)
export type AccidentShortDictionary = {
  paymentOptions: Dictionary[];
  actions: Dictionary[];
  activityTypes: Dictionary[];
  coveragePeriods: Dictionary[];
  documentTypes: Dictionary[];
  exclusions: Dictionary[];
  insurancePremiumPaymentTerms: Dictionary[];
  insuranceRules: Dictionary[];
  riskStartingDict: Dictionary[];
  percentDaysDict: Dictionary[];
  tableDict: Dictionary[];
  responsibilityZones: Dictionary[];
  salesChannels: Dictionary[];
  specialPrograms: Dictionary[];
  sumMethods: Dictionary[];
  sumOrders: Dictionary[];
};

// Тип для другого продукта (для примера, чтобы показать динамику)
export type AutoShortDictionary = {
  brands: Dictionary[];
  models: Dictionary[];
  years: Dictionary[];
};

// ==========================================
// 2. КАРТЫ ПРОДУКТОВ (МАГИЯ ЗДЕСЬ)
// ==========================================

// Карта: какой продукт -> какой тип ответа от бэкенда
export type ProductResponseMap = {
  accidents: AccidentShortDictionary;
  auto: AutoShortDictionary;
  // Чтобы добавить новый продукт, просто допиши строчку сюда:
  // health: HealthShortDictionary;
};

// Вытаскиваем названия продуктов из карты.
// Теперь PRODUCT = 'accidents' | 'auto' (автоматически)
export type PRODUCT = keyof ProductResponseMap;

// Карта: какой продукт -> какие коды поиска ему доступны
export type ProductCodeMap = {
  accidents: 'professions' | 'sports';
  auto: 'brands' | 'models';
  // health: 'clinics' | 'doctors';
};

// Тип параметров для поиска. T — это конкретный продукт.
// TypeScript сам подставит нужные коды в зависимости от T.
export type SearchDictionariesParams<T extends PRODUCT> = {
  code: ProductCodeMap[T];
  query?: string;
  page?: number;
  page_size?: number;
};

// ==========================================
// 3. МОК-КЛИЕНТ (Заглушка вместо axios)
// ==========================================
// Это просто чтобы код скомпилировался без реального axios
const dictionariesClient = {
  get: async <T>(url: string, config?: any): Promise<{ data: T }> => {
    console.log(`[Mock Request] GET ${url}`, config);
    return { data: {} as T };
  },
};

// ==========================================
// 4. API С ДЖЕНЕРИКАМИ
// ==========================================

export const dictionariesApi = {
  // T extends PRODUCT — означает, что T может быть только 'accidents' или 'auto'
  // Promise<ProductResponseMap[T]> — означает, что возвращаемый тип зависит от T
  getShortDictionaries: async <T extends PRODUCT>(
    product: T
  ): Promise<ProductResponseMap[T]> => {
    const response = await dictionariesClient.get<ProductResponseMap[T]>(
      `/api/v1/${product}/short`
    );
    return response.data;
  },

  searchDictionary: async <T extends PRODUCT>(
    product: T,
    params: SearchDictionariesParams<T> // Параметры зависят от продукта
  ): Promise<ProductResponseMap[T]> => {
    const response = await dictionariesClient.get<ProductResponseMap[T]>(
      `/api/v1/${product}/search`,
      { params }
    );
    return response.data;
  },
};

// ==========================================
// 5. ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ (Проверка типов)
// ==========================================

async function testMagic() {
  // 1. Работает отлично. IDE знает, что вернется AccidentShortDictionary
  const accidentsData = await dictionariesApi.getShortDictionaries('accidents');
  
  // Проверка: тут IDE должна подсказывать поля из AccidentShortDictionary
  console.log(accidentsData.paymentOptions); 
  // console.log(accidentsData.brands); // ОШИБКА! В accidents нет brands

  // 2. Работает отлично. Вернется AutoShortDictionary
  const autoData = await dictionariesApi.getShortDictionaries('auto');
  
  // Проверка: тут IDE подсказывает поля из AutoShortDictionary
  console.log(autoData.brands);
  // console.log(autoData.paymentOptions); // ОШИБКА! В auto нет paymentOptions

  // 3. Поиск с параметрами. IDE знает, что для accidents доступны только 'professions' и 'sports'
  await dictionariesApi.searchDictionary('accidents', {
    code: 'professions', // ОК
    // code: 'brands',   // ОШИБКА! accidents не поддерживает brands
    query: 'test'
  });

  // 4. Поиск для auto
  await dictionariesApi.searchDictionary('auto', {
    code: 'brands', // ОК
    // code: 'professions', // ОШИБКА! auto не поддерживает professions
    query: 'test'
  });

  // 5. ОШИБКА! Продукта 'unknown' нет в ProductResponseMap
  // await dictionariesApi.getShortDictionaries('unknown');
}