public phone(isOptional = false) {
  // Создаем базовую схему строки с сообщением об ошибке
  const schema = z
    .string({ message: "Введите номер телефона" })
    .refine(isNotEmpty, EMPTY_MESSAGE);

  // Если поле опциональное, разрешаем пустую строку
  if (isOptional) {
    return schema
      .refine(
        (val) => val === "" || val.length === 18, 
        "Проверьте длину номера. Должно быть 11 цифр"
      )
      // Если пришла пустая строка, превращаем её в undefined, чтобы Zod не ругался
      .transform((val) => (val === "" ? undefined : val))
      .optional();
  }

  // Если не опциональное — строгая проверка длины
  return schema.refine(
    (val) => val.length === 18, 
    "Проверьте длину номера. Должно быть 11 цифр"
  );
}