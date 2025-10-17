import { z } from "zod";

// Схема для входных данных формы
export const smsCodeInputSchema = z.object({
  digits: z.array(
    z.number({
      required_error: "Все поля должны быть заполнены",
      invalid_type_error: "Должна быть цифра",
    })
    .min(0)
    .max(9)
  ).length(6, "Код должен содержать 6 цифр")
});

// Схема для выходных данных (после transform)
export const smsCodeOutputSchema = z.object({
  code: z.string().length(6, "Код должен содержать 6 цифр")
});

// Общая схема с transform
export const smsCodeSchema = smsCodeInputSchema.transform((data) => ({
  code: data.digits.join("")
}));

export type SmsCodeInput = z.infer<typeof smsCodeInputSchema>;
export type SmsCodeOutput = z.infer<typeof smsCodeOutputSchema>;



import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const SmsCodeComponent = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<SmsCodeInput>({
    resolver: zodResolver(smsCodeSchema),
    defaultValues: {
      digits: [NaN, NaN, NaN, NaN, NaN, NaN],
    },
    mode: 'onChange'
  });

  const onSubmit = async (data: SmsCodeInput) => {
    try {
      // Валидируем и преобразуем данные
      const result = smsCodeSchema.parse(data);
      // Теперь result имеет тип { code: string }
      console.log('SMS код:', result.code);
      
      // Отправка на сервер
      // await api.verifyCode(result.code);
      
    } catch (error) {
      console.error('Ошибка валидации:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Ваши инпуты для digits */}
      <div className={styles.container}>
        {/* ... */}
      </div>
      
      <Modal.Footer>
        <Button type="submit" disabled={isSubmitting}>
          Подтвердить
        </Button>
        <Button onClick={handleClose}>Отменить</Button>
      </Modal.Footer>
    </form>
  );
};