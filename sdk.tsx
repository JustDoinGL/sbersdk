import { z } from 'zod';

// Базовая валидация для кириллических имен
const cyrillicNameSchema = z.object({
  lastName: z.string()
    .min(1, "Фамилия обязательна")
    .max(100, "Слишком длинная фамилия")
    .regex(/^[А-Яа-яЁё\-\s]+$/, "Фамилия может содержать только кириллические буквы, дефисы и пробелы")
    .refine((val) => {
      // Проверяем, что начинается с буквы и заканчивается буквой
      return /^[А-Яа-яЁё]/.test(val) && /[А-Яа-яЁё]$/.test(val);
    }, "Фамилия должна начинаться и заканчиваться буквой")
    .refine((val) => {
      // Проверяем, что нет двух дефисов или пробелов подряд
      return !/(\-\-|\s\s)/.test(val);
    }, "Некорректное использование дефисов или пробелов"),

  firstName: z.string()
    .min(1, "Имя обязательно")
    .max(100, "Слишком длинное имя")
    .regex(/^[А-Яа-яЁё\-\s]+$/, "Имя может содержать только кириллические буквы, дефисы и пробелы")
    .refine((val) => {
      return /^[А-Яа-яЁё]/.test(val) && /[А-Яа-яЁё]$/.test(val);
    }, "Имя должно начинаться и заканчиваться буквой")
    .refine((val) => {
      return !/(\-\-|\s\s)/.test(val);
    }, "Некорректное использование дефисов или пробелов"),

  middleName: z.string()
    .max(100, "Слишком длинное отчество")
    .regex(/^[А-Яа-яЁё\-\s]*$/, "Отчество может содержать только кириллические буквы, дефисы и пробелы")
    .optional()
    .refine((val) => {
      if (!val || val.length === 0) return true; // отчество необязательно
      return /^[А-Яа-яЁё]/.test(val) && /[А-Яа-яЁё]$/.test(val);
    }, "Отчество должно начинаться и заканчиваться буквой")
    .refine((val) => {
      if (!val) return true;
      return !/(\-\-|\s\s)/.test(val);
    }, "Некорректное использование дефисов или пробелов"),
});

// Более строгий вариант с проверкой заглавных букв
const strictCyrillicNameSchema = z.object({
  lastName: z.string()
    .min(1, "Фамилия обязательна")
    .max(100, "Слишком длинная фамилия")
    .regex(/^[А-ЯЁ][А-Яа-яЁё]*(?:[\-\s][А-ЯЁ]?[А-Яа-яЁё]*)*$/, "Фамилия должна начинаться с заглавной буквы и содержать только кириллицу, дефисы и пробелы"),

  firstName: z.string()
    .min(1, "Имя обязательно")
    .max(100, "Слишком длинное имя")
    .regex(/^[А-ЯЁ][А-Яа-яЁё]*(?:[\-\s][А-ЯЁ]?[А-Яа-яЁё]*)*$/, "Имя должно начинаться с заглавной буквы и содержать только кириллицу, дефисы и пробелы"),

  middleName: z.string()
    .max(100, "Слишком длинное отчество")
    .regex(/^[А-ЯЁ]?[А-Яа-яЁё]*(?:[\-\s][А-ЯЁ]?[А-Яа-яЁё]*)*$/, "Отчество может содержать только кириллицу, дефисы и пробелы")
    .optional(),
});

// Основные функции для использования
export const validatePersonName = (data: unknown) => {
  return cyrillicNameSchema.safeParse(data);
};

export const validatePersonSearch = z.object({
  lastName: z.string()
    .max(100)
    .regex(/^[А-Яа-яЁё\-\s]*$/, "Для поиска можно использовать только кириллические буквы, дефисы и пробелы")
    .optional(),
  firstName: z.string()
    .max(100)
    .regex(/^[А-Яа-яЁё\-\s]*$/, "Для поиска можно использовать только кириллические буквы, дефисы и пробелы")
    .optional(),
  middleName: z.string()
    .max(100)
    .regex(/^[А-Яа-яЁё\-\s]*$/, "Для поиска можно использовать только кириллические буквы, дефисы и пробелы")
    .optional(),
});

// Примеры тестирования
const testCases = [
  // Валидные случаи
  { lastName: "Петров-Сидоров", firstName: "Анна-Мария", middleName: "Сеймур оглы" },
  { lastName: "Иванов", firstName: "Петр", middleName: "Сергеевич" },
  { lastName: "Ван Гог", firstName: "Мария", middleName: "Ивановна" },
  { lastName: "Алехин-Маслов", firstName: "Екатерина", middleName: "" },
  
  // Невалидные случаи
  { lastName: "Petrov", firstName: "Анна", middleName: "Сергеевич" }, // латиница
  { lastName: "Иванов123", firstName: "Анна", middleName: "Сергеевич" }, // цифры
  { lastName: "Иванов--Петров", firstName: "Анна", middleName: "Сергеевич" }, // два дефиса подряд
  { lastName: "Иванов", firstName: "Анна-", middleName: "Сергеевич" }, // заканчивается на дефис
  { lastName: "-Иванов", firstName: "Анна", middleName: "Сергеевич" }, // начинается с дефиса
];

// Тестирование
testCases.forEach((testCase, i) => {
  const result = validatePersonName(testCase);
  console.log(`Тест ${i + 1}: ${testCase.lastName} ${testCase.firstName} ${testCase.middleName}`);
  console.log(result.success ? "✓ Валидно" : "✗ Невалидно");
  if (!result.success) {
    result.error.issues.forEach(issue => {
      console.log(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
  }
  console.log('---');
});