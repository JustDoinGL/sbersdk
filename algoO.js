import { z } from "zod";

export const smsCodeSchema = z.object({
  digits: z.array(
    z.number({
      required_error: "Все поля должны быть заполнены",
      invalid_type_error: "Должна быть цифра",
    })
    .min(0)
    .max(9)
  ).length(6, "Код должен содержать 6 цифр")
}).pipe(
  z.object({
    digits: z.array(z.number())
  }).transform((data) => ({
    code: data.digits.join("")
  }))
);

export type SmsCodeSchema = z.infer<typeof smsCodeSchema>;