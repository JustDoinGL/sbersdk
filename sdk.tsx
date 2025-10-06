
import { z } from 'zod';

// Базовая валидация для одной части имени/фамилии
const namePartSchema = z.string()
  .min(1, "Обязательное поле")
  .max(50, "Слишком длинное значение")
  .regex(/^[A-Za-zА-Яа-яЁё\-]+$/, "Допустимы только буквы и дефис");

// Схема для полного ФИО с поддержкой сложных конструкций
const personNameSchema = z.object({
  lastName: z.string()
    .min(1, "Фамилия обязательна")
    .max(100, "Слишком длинная фамилия")
    .regex(/^[A-Za-zА-Яа-яЁё\-\s]+$/, "Фамилия может содержать только буквы, дефисы и пробелы")
    .refine((val) => {
      // Проверяем, что каждая часть фамилии (разделенная дефисом или пробелом) валидна
      const parts = val.split(/[\-\s]+/);
      return parts.every(part => namePartSchema.safeParse(part).success);
    }, "Некорректный формат фамилии"),

  firstName: z.string()
    .min(1, "Имя обязательно")
    .max(100, "Слишком длинное имя")
    .regex(/^[A-Za-zА-Яа-яЁё\-\s]+$/, "Имя может содержать только буквы, дефисы и пробелы")
    .refine((val) => {
      const parts = val.split(/[\-\s]+/);
      return parts.every(part => namePartSchema.safeParse(part).success);
    }, "Некорректный формат имени"),

  middleName: z.string()
    .max(100, "Слишком длинное отчество")
    .regex(/^[A-Za-zА-Яа-яЁё\-\s]*$/, "Отчество может содержать только буквы, дефисы и пробелы")
    .optional()
    .refine((val) => {
      if (!val) return true; // отчество необязательно
      const parts = val.split(/[\-\s]+/);
      return parts.every(part => namePartSchema.safeParse(part).success);
    }, "Некорректный формат отчества"),
});

// Альтернативный вариант - более строгая валидация
const strictPersonNameSchema = z.object({
  lastName: z.string()
    .min(1, "Фамилия обязательна")
    .max(100, "Слишком длинная фамилия")
    .regex(/^[A-Za-zА-Яа-яЁё]+(?:[\-\s][A-Za-zА-Яа-яЁё]+)*$/, "Некорректный формат фамилии"),

  firstName: z.string()
    .min(1, "Имя обязательно")
    .max(100, "Слишком длинное имя")
    .regex(/^[A-Za-zА-Яа-яЁё]+(?:[\-\s][A-Za-zА-Яа-яЁё]+)*$/, "Некорректный формат имени"),

  middleName: z.string()
    .max(100, "Слишком длинное отчество")
    .regex(/^[A-Za-zА-Яа-яЁё]*(?:[\-\s][A-Za-zА-Яа-яЁё]+)*$/, "Некорректный формат отчества")
    .optional(),
});

// Функция для валидации при создании/редактировании
export const validatePersonName = (data: unknown) => {
  return personNameSchema.safeParse(data);
};

// Функция для валидации при поиске (может быть менее строгой)
export const validatePersonSearch = z.object({
  lastName: z.string().max(100).optional(),
  firstName: z.string().max(100).optional(),
  middleName: z.string().max(100).optional(),
});

// Примеры использования:
const testCases = [
  // Валидные случаи
  { lastName: "Петров-Сидоров", firstName: "Анна-Мария", middleName: "Сеймур оглы" },
  { lastName: "Иванов", firstName: "Петр", middleName: "Сергеевич" },
  { lastName: "Smith-Jones", firstName: "Mary-Ann", middleName: "" },
  
  // Невалидные случаи
  { lastName: "Петров123", firstName: "Анна", middleName: "Сергеевич" }, // цифры
  { lastName: "Иванов", firstName: "John@", middleName: "Сергеевич" }, // спецсимволы
];

testCases.forEach((testCase, i) => {
  const result = validatePersonName(testCase);
  console.log(`Тест ${i + 1}:`, result.success ? "✓ Валидно" : "✗ Невалидно");
  if (!result.success) console.log("Ошибки:", result.error.issues);
});