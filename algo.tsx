public award(isOptional = true) {
  return z
    .string()
    .transform((val, ctx): number | undefined => {
      // Проверяем пустое значение
      const isEmpty = val === null || val === undefined || val.trim() === '';
      
      // Если optional и пустое - возвращаем undefined
      if (isOptional && isEmpty) {
        return undefined;
      }
      
      // Если не optional и пустое - ошибка
      if (!isOptional && isEmpty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Поле обязательно для заполнения",
        });
        return z.NEVER;
      }
      
      // Очищаем строку
      const cleaned = val
        .replace(/\s+/g, '')
        .replace(',', '.');
      
      // Преобразуем в число
      const num = Number(cleaned);
      
      // Проверяем что это валидное число
      if (Number.isNaN(num) || !Number.isFinite(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Неверный формат: только цифры, точка или запятая",
        });
        return z.NEVER;
      }
      
      return num;
    })
    .pipe(
      z
        .number()
        .min(0, { message: "Премия не может быть меньше 0" })
        .max(10000000, { message: "Премия не может быть больше 10 000 000" })
        .refine((v) => {
          const parts = Math.abs(v).toString().split('.');
          return !parts[1] || parts[1].length <= 2;
        }, "Не более 2-х знаков после запятой")
        .optional(isOptional)
    );
}