export const paymentStepSchema = z
  .object({
    email: baseSchema.email(),
    isSelectPhone: z.boolean(),
    phone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isSelectPhone) {
      const phoneResult = baseSchema.phone().safeParse(data.phone);
      if (!phoneResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: phoneResult.error.issues[0].message,
          path: ["phone"],
        });
      }
    }
  })
  .transform((data) => {
    if (!data.isSelectPhone) {
      const { phone, ...rest } = data;
      return rest; // Возвращаем объект без phone
    }
    return data;
  });

// Тут тип для формы и для сабмита совпадает
type FormValues = z.input<typeof paymentStepSchema>; // { email, isSelectPhone, phone? }