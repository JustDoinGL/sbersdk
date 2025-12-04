public award(isOptional = true) {
  return z
    .string()
    .transform((val) => {
      // Если optional и пусто - undefined
      if (isOptional && (!val || val.trim() === '')) {
        return undefined;
      }
      
      // Очистка
      const cleaned = val?.replace(/\s+/g, '')?.replace(',', '.') || '';
      const num = Number(cleaned);
      
      // Если не optional и пусто - NaN (будет ошибка)
      // Если не число - NaN (будет ошибка)
      return Number.isNaN(num) ? Number.NaN : num;
    })
    .pipe(
      z
        .number({
          invalid_type_error: "Должно быть числом"
        })
        .refine(v => !Number.isNaN(v), {
          message: isOptional
            ? "Введите число или оставьте пустым"
            : "Неверный формат числа"
        })
        .min(0, { message: "Премия не может быть меньше 0" })
        .max(10000000, { message: "Премия не может быть больше 10 000 000" })
        .refine((v) => {
          if (!v) return true;
          const parts = v.toString().split('.');
          return parts[1] ? parts[1].length <= 2 : true;
        }, "Не более 2-х знаков после запятой")
    )
    .optional(isOptional);
}