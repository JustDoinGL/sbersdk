// Фабрика для создания кастомных схем
export const createNameSchema = (options?: {
  required?: boolean;
  fieldName?: string;
  maxLength?: number;
}) => {
  const { 
    required = true, 
    fieldName = 'Поле',
    maxLength = 100 
  } = options || {};

  let schema = z.string()
    .max(maxLength, `Слишком длинное значение`)
    .regex(/^[А-Яа-яЁё\-\s]*$/, `${fieldName} может содержать только кириллические буквы, дефисы и пробелы`)
    .refine((val) => !/(\-\-|\s\s)/.test(val), 
      "Некорректное использование дефисов или пробелов");

  if (required) {
    schema = schema
      .min(1, `${fieldName} обязательно`)
      .refine((val) => /^[А-Яа-яЁё]/.test(val) && /[А-Яа-яЁё]$/.test(val), 
        `${fieldName} должно начинаться и заканчиваться буквой`);
  } else {
    schema = schema
      .refine((val) => !val || (/^[А-Яа-яЁё]/.test(val) && /[А-Яа-яЁё]$/.test(val)), 
        `${fieldName} должно начинаться и заканчиваться буквой`);
  }

  return schema;
};


import { z } from 'zod';

// Базовые схемы для отдельных полей
export const lastNameSchema = z.string()
  .min(1, "Фамилия обязательна")
  .max(100, "Слишком длинная фамилия")
  .regex(/^[А-Яа-яЁё\-\s]+$/, "Фамилия может содержать только кириллические буквы, дефисы и пробелы")
  .refine((val) => /^[А-Яа-яЁё]/.test(val) && /[А-Яа-яЁё]$/.test(val), 
    "Фамилия должна начинаться и заканчиваться буквой")
  .refine((val) => !/(\-\-|\s\s)/.test(val), 
    "Некорректное использование дефисов или пробелов");

export const firstNameSchema = z.string()
  .min(1, "Имя обязательно")
  .max(100, "Слишком длинное имя")
  .regex(/^[А-Яа-яЁё\-\s]+$/, "Имя может содержать только кириллические буквы, дефисы и пробелы")
  .refine((val) => /^[А-Яа-яЁё]/.test(val) && /[А-Яа-яЁё]$/.test(val), 
    "Имя должно начинаться и заканчиваться буквой")
  .refine((val) => !/(\-\-|\s\s)/.test(val), 
    "Некорректное использование дефисов или пробелов");

export const middleNameSchema = z.string()
  .max(100, "Слишком длинное отчество")
  .regex(/^[А-Яа-яЁё\-\s]*$/, "Отчество может содержать только кириллические буквы, дефисы и пробелы")
  .optional()
  .refine((val) => !val || (/^[А-Яа-яЁё]/.test(val) && /[А-Яа-яЁё]$/.test(val)), 
    "Отчество должно начинаться и заканчиваться буквой")
  .refine((val) => !val || !/(\-\-|\s\s)/.test(val), 
    "Некорректное использование дефисов или пробелов");
