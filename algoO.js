export const smsCodeSchema = z.object({
  digits: z.array(
    z.number({ 
      required_error: "Все поля должны быть заполнены",
      invalid_type_error: "Должна быть цифра"
    }).min(0).max(9)
  ).length(6, "Код должен содержать 6 цифр")
}).refine(
  (data) => {
    const fullCode = data.digits.join('');
    return /^\d{6}$/.test(fullCode);
  },
  {
    message: "Код должен содержать ровно 6 цифр",
    path: ["digits"]
  }
);

export type SmsCodeSchema = z.infer<typeof smsCodeSchema>;