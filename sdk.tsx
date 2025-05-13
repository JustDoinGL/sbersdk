import { z } from "zod";

const phoneSchema = z.string()
  .min(1, "Номер телефона обязателен")
  .transform((value) => {
    // Удаляем все нецифровые символы
    const digits = value.replace(/\D/g, '');
    // Проверяем, что номер начинается с 7 (учитывая предзаполнение +7)
    return digits.startsWith('7') ? digits : `7${digits}`;
  })
  .refine((value) => {
    // Проверяем длину номера (11 цифр с учетом 7 в начале)
    return value.length === 11;
  }, {
    message: "Номер телефона должен содержать 10 цифр после +7"
  })
  .refine((value) => {
    // Проверяем первую цифру, которую вводит пользователь (вторая цифра после 7)
    const firstUserDigit = value[1];
    return ['3', '4', '5', '6', '8', '9'].includes(firstUserDigit);
  }, {
    message: "Проверьте код оператора или региона — он может начинаться на 3, 4, 5, 6, 8, 9"
  });

// Пример использования
try {
  const validatedPhone = phoneSchema.parse("+7 (912) 345-67-89");
  console.log(validatedPhone); // "79123456789"
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.errors[0].message);
  }
}