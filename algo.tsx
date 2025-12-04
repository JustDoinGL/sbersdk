import { z } from 'zod';

// 1. Исправленная валидация email
const emailSchema = z.string()
  .email({ message: "Некорректный адрес. Пример: пример@пример.ru" });

// Или если хотите кастомную валидацию:
const customEmailSchema = z.string()
  .min(1, { message: "Email обязателен" })
  .refine(
    (val) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val),
    { message: "Некорректный адрес. Пример: пример@пример.ru" }
  );

// 2. Исправленная валидация для денежной суммы (премии)
const awardSchema = z.string()
  .min(1, { message: "Поле обязательно" })
  .refine((val) => {
    // Удаляем пробелы и заменяем запятые на точки
    const cleaned = val.trim().replace(/\s+/g, '').replace(',', '.');
    
    // Проверяем, что это число
    const num = parseFloat(cleaned);
    return !isNaN(num);
  }, { message: "Должно быть числом" })
  .transform((val) => {
    // Преобразуем строку в число
    const cleaned = val.trim().replace(/\s+/g, '').replace(',', '.');
    return parseFloat(cleaned);
  })
  .refine((val) => val >= 0, { 
    message: "Премия конкурента не может быть меньше 0" 
  })
  .refine((val) => val <= 10000000, { 
    message: "Премия не может быть больше 10 000 000" 
  })
  .refine((val) => {
    // Проверяем количество знаков после запятой
    const str = val.toString();
    const parts = str.split('.');
    return parts[1] ? parts[1].length <= 2 : true;
  }, { message: "Не более 2 знаков после запятой" });

// 3. Упрощенная версия с трансформером
const awardSchemaSimple = z.string()
  .min(1, { message: "Поле обязательно" })
  .transform((val) => {
    // Очищаем и преобразуем
    const cleaned = val.trim()
      .replace(/\s+/g, '')      // удаляем пробелы
      .replace(',', '.');       // заменяем запятую на точку
    
    const num = parseFloat(cleaned);
    
    // Проверяем сразу несколько условий
    if (isNaN(num)) {
      throw new Error("Должно быть числом");
    }
    
    if (num < 0) {
      throw new Error("Премия конкурента не может быть меньше 0");
    }
    
    if (num > 10000000) {
      throw new Error("Премия не может быть больше 10 000 000");
    }
    
    // Проверяем десятичные знаки
    const decimalPart = cleaned.split('.')[1];
    if (decimalPart && decimalPart.length > 2) {
      throw new Error("Не более 2 знаков после запятой");
    }
    
    return num;
  });

// 4. Альтернативный вариант с кастомной валидацией
const createAwardSchema = () => {
  return z.string()
    .min(1, "Поле обязательно")
    .refine(validateAward, "Некорректное значение")
    .transform(parseAward);
};

function validateAward(value: string): boolean {
  // Регулярное выражение для числа с максимум 2 знаками после запятой
  const regex = /^\s*\d{1,10}(?:[.,]\d{0,2})?\s*$/;
  if (!regex.test(value)) return false;
  
  // Преобразуем и проверяем диапазон
  const cleaned = value.trim().replace(/\s+/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  
  return !isNaN(num) && num >= 0 && num <= 10000000;
}

function parseAward(value: string): number {
  const cleaned = value.trim().replace(/\s+/g, '').replace(',', '.');
  return parseFloat(cleaned);
}

// 5. Использование с форматированием ввода
const awardSchemaWithFormatting = z.string()
  .transform((val, ctx) => {
    // Убираем все пробелы и лишние символы
    const cleaned = val.replace(/\s+/g, '').replace(',', '.');
    
    // Проверяем, что это число
    const num = parseFloat(cleaned);
    if (isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Введите число",
      });
      return z.NEVER;
    }
    
    return {
      original: val,
      value: num,
      formatted: num.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    };
  })
  .refine((data) => data.value >= 0, {
    message: "Премия конкурента не может быть меньше 0"
  })
  .refine((data) => data.value <= 10000000, {
    message: "Премия не может быть больше 10 000 000"
  })
  .refine((data) => {
    const parts = data.value.toString().split('.');
    return parts[1] ? parts[1].length <= 2 : true;
  }, {
    message: "Не более 2 знаков после запятой"
  });

// Пример использования
try {
  const validAward = awardSchema.parse("10 000,50"); // ✅ 10000.5
  const validAward2 = awardSchema.parse("5000"); // ✅ 5000
  const invalidAward = awardSchema.parse("10 000 000,001"); // ❌
} catch (error) {
  console.error(error.errors);
}

// 6. Для формы с несколькими полями
export const competitorSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: customEmailSchema,
  award: awardSchemaSimple,
  // ... другие поля
});

// 7. Если нужно сохранять как строку с форматированием
const awardStringSchema = z.string()
  .min(1, "Поле обязательно")
  .refine((val) => {
    // Проверяем формат: пробелы разрешены, запятая или точка для десятичных
    const regex = /^(\d{1,3}(?:\s?\d{3})*)(?:[.,]\d{1,2})?$/;
    return regex.test(val.trim());
  }, "Пример: 10 000,50 или 10000.50")
  .refine((val) => {
    const cleaned = val.replace(/\s+/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return num >= 0 && num <= 10000000;
  }, "Диапазон: 0 - 10 000 000");