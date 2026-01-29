import { z } from 'zod';

// Схема для водительского удостоверения
const driverLicenseSchema = z.object({
  type: z.string().min(1, "Тип ВУ обязателен"),
  seriesNumber: z.string().min(1, "Серия и номер ВУ обязательны"),
  issueDate: z.string().min(1, "Дата начала стажа обязательна"),
});

// Схема для предыдущего ВУ (необязательно)
const previousLicenseSchema = driverLicenseSchema.partial().optional();

// Схема для одного водителя
const driverSchema = z.object({
  fullName: z.string().min(1, "ФИО обязательно"),
  birthDate: z.string().min(1, "Дата рождения обязательна"),
  currentLicense: driverLicenseSchema,
  hasChangedLicense: z.boolean().default(false),
  previousLicense: previousLicenseSchema,
});

// Схема для формы с несколькими водителями
const driversFormSchema = z.object({
  drivers: z.array(driverSchema).min(1, "Добавьте хотя бы одного водителя"),
  insuranceScope: z.enum(["specific", "any"]).default("specific"),
  selectedStation: z.string().optional(),
});

// Типы TypeScript
type DriverLicense = z.infer<typeof driverLicenseSchema>;
type PreviousLicense = z.infer<typeof previousLicenseSchema>;
type Driver = z.infer<typeof driverSchema>;
type DriversFormData = z.infer<typeof driversFormSchema>;







/**
 * Генерирует ключи с префиксами для формы с несколькими водителями
 * @param index - индекс водителя (начинается с 0)
 * @param field - поле водителя
 * @returns ключ с префиксом вида "drivers[0].fullName"
 */
const getDriverFieldKey = (index: number, field: keyof Driver): string => {
  return `drivers[${index}].${field}`;
};

/**
 * Генерирует ключи с префиксами для водительского удостоверения
 * @param index - индекс водителя
 * @param prefix - "currentLicense" или "previousLicense"
 * @param field - поле ВУ
 * @returns ключ с префиксом
 */
const getLicenseFieldKey = (
  index: number, 
  prefix: 'currentLicense' | 'previousLicense', 
  field: keyof DriverLicense
): string => {
  return `drivers[${index}].${prefix}.${field}`;
};

// Примеры использования:
const examples = {
  // Ключи для первого водителя
  driver1FullName: getDriverFieldKey(0, 'fullName'), // "drivers[0].fullName"
  driver1BirthDate: getDriverFieldKey(0, 'birthDate'), // "drivers[0].birthDate"
  driver1LicenseNumber: getLicenseFieldKey(0, 'currentLicense', 'seriesNumber'), // "drivers[0].currentLicense.seriesNumber"
  
  // Ключи для второго водителя
  driver2FullName: getDriverFieldKey(1, 'fullName'), // "drivers[1].fullName"
  driver2PreviousLicenseDate: getLicenseFieldKey(1, 'previousLicense', 'issueDate'), // "drivers[1].previousLicense.issueDate"
};

/**
 * Функция для парсинга ключей с префиксами (если данные приходят в плоском виде)
 * @param data - объект с плоскими ключами типа "drivers[0].fullName"
 * @returns структурированный объект DriversFormData
 */
const parsePrefixedData = (data: Record<string, any>): DriversFormData => {
  const result: Partial<DriversFormData> = {
    drivers: [],
    insuranceScope: data.insuranceScope as "specific" | "any",
    selectedStation: data.selectedStation,
  };

  // Находим максимальный индекс водителя
  const driverKeys = Object.keys(data).filter(key => key.startsWith('drivers['));
  const maxIndex = Math.max(...driverKeys.map(key => {
    const match = key.match(/drivers\[(\d+)\]/);
    return match ? parseInt(match[1], 10) : -1;
  }));

  // Собираем данные по водителям
  for (let i = 0; i <= maxIndex; i++) {
    const driver: Partial<Driver> = {
      fullName: data[`drivers[${i}].fullName`],
      birthDate: data[`drivers[${i}].birthDate`],
      hasChangedLicense: data[`drivers[${i}].hasChangedLicense`] === 'true',
      currentLicense: {
        type: data[`drivers[${i}].currentLicense.type`],
        seriesNumber: data[`drivers[${i}].currentLicense.seriesNumber`],
        issueDate: data[`drivers[${i}].currentLicense.issueDate`],
      },
    };

    // Если есть данные о предыдущем ВУ
    if (data[`drivers[${i}].previousLicense.type`]) {
      driver.previousLicense = {
        type: data[`drivers[${i}].previousLicense.type`],
        seriesNumber: data[`drivers[${i}].previousLicense.seriesNumber`],
        issueDate: data[`drivers[${i}].previousLicense.issueDate`],
      };
    }

    result.drivers?.push(driver as Driver);
  }

  return driversFormSchema.parse(result);
};

/**
 * Функция для преобразования данных в плоский формат с префиксами
 * @param formData - структурированные данные формы
 * @returns объект с плоскими ключами
 */
const flattenToPrefixedData = (formData: DriversFormData): Record<string, any> => {
  const result: Record<string, any> = {
    insuranceScope: formData.insuranceScope,
    selectedStation: formData.selectedStation,
  };

  formData.drivers.forEach((driver, index) => {
    // Основные поля водителя
    result[`drivers[${index}].fullName`] = driver.fullName;
    result[`drivers[${index}].birthDate`] = driver.birthDate;
    result[`drivers[${index}].hasChangedLicense`] = driver.hasChangedLicense;

    // Текущее ВУ
    result[`drivers[${index}].currentLicense.type`] = driver.currentLicense.type;
    result[`drivers[${index}].currentLicense.seriesNumber`] = driver.currentLicense.seriesNumber;
    result[`drivers[${index}].currentLicense.issueDate`] = driver.currentLicense.issueDate;

    // Предыдущее ВУ (если есть)
    if (driver.previousLicense) {
      result[`drivers[${index}].previousLicense.type`] = driver.previousLicense.type;
      result[`drivers[${index}].previousLicense.seriesNumber`] = driver.previousLicense.seriesNumber;
      result[`drivers[${index}].previousLicense.issueDate`] = driver.previousLicense.issueDate;
    }
  });

  return result;
};

// Пример использования
const exampleData: DriversFormData = {
  insuranceScope: "specific",
  selectedStation: "Москва, ул. Примерная, 1",
  drivers: [
    {
      fullName: "Равушев Константин Олегович",
      birthDate: "21.10.1995",
      hasChangedLicense: false,
      currentLicense: {
        type: "Российской Федерации",
        seriesNumber: "1234 567890",
        issueDate: "01.01.2015"
      }
    }
  ]
};

// Преобразование в плоский формат
const flatData = flattenToPrefixedData(exampleData);
console.log(flatData);
/*
{
  "insuranceScope": "specific",
  "selectedStation": "Москва, ул. Примерная, 1",
  "drivers[0].fullName": "Равушев Константин Олегович",
  "drivers[0].birthDate": "21.10.1995",
  "drivers[0].hasChangedLicense": false,
  "drivers[0].currentLicense.type": "Российской Федерации",
  "drivers[0].currentLicense.seriesNumber": "1234 567890",
  "drivers[0].currentLicense.issueDate": "01.01.2015"
}
*/

// Обратное преобразование
const parsedData = parsePrefixedData(flatData);



