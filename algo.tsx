public award(isOptional = true) {
  // Используем preprocess для обработки разных форматов ввода
  const schema = z.preprocess(
    (val) => {
      // Если значение уже число
      if (typeof val === 'number') return val;
      
      // Если строка
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed === '') return isOptional ? undefined : Number.NaN;
        
        const cleaned = trimmed.replace(/\s+/g, '').replace(',', '.');
        const num = Number(cleaned);
        return Number.isNaN(num) ? Number.NaN : num;
      }
      
      // Если null/undefined
      if (val === null || val === undefined) {
        return isOptional ? undefined : Number.NaN;
      }
      
      return Number.NaN;
    },
    z
      .number({
        invalid_type_error: "Должно быть числом",
        required_error: isOptional ? undefined : "Поле обязательно"
      })
      .refine(val => !Number.isNaN(val), {
        message: "Неверный формат числа"
      })
      .min(0, { message: "Премия не может быть меньше 0" })
      .max(10000000, { message: "Премия не может быть больше 10 000 000" })
      .refine((v) => {
        const parts = Math.abs(v).toString().split('.');
        return !parts[1] || parts[1].length <= 2;
      }, "Не более 2-х знаков после запятой")
  );

  return isOptional ? schema.optional().nullable() : schema;
}