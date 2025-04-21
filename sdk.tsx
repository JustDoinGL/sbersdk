import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Определяем схему валидации с помощью Zod
const formSchema = z.object({
  targetAudience: z.enum(['business', 'individual']),
  companyName: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  inn: z.string()
    .min(10, 'ИНН должен содержать 10 или 12 цифр')
    .max(12, 'ИНН должен содержать 10 или 12 цифр')
    .regex(/^\d+$/, 'ИНН должен содержать только цифры'),
  city: z.string().min(2, 'Укажите город'),
  phone: z.string()
    .min(11, 'Номер должен содержать 11 цифр')
    .max(11, 'Номер должен содержать 11 цифр')
    .regex(/^\d+$/, 'Номер должен содержать только цифры'),
  agreement: z.literal(true, {
    errorMap: () => ({ message: 'Необходимо согласие на обработку данных' }),
  }),
});

type FormData = z.infer<typeof formSchema>;

export const SberPartnerForm = () => {
  // 2. Инициализируем форму
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetAudience: undefined,
      companyName: '',
      inn: '',
      city: '',
      phone: '',
      agreement: false,
    },
  });

  const targetAudience = watch('targetAudience');

  // 3. Обработчик отправки формы
  const onSubmit = (data: FormData) => {
    console.log('Форма отправлена:', data);
    // Здесь можно добавить логику отправки на сервер
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="sber-form">
      {/* 1. Выбор аудитории */}
      <div className="form-section">
        <h3>Кому вы планируете предлагать продукты Сбера?</h3>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="business"
              {...register('targetAudience')}
            />
            Бизнесу
          </label>
          <label>
            <input
              type="radio"
              value="individual"
              {...register('targetAudience')}
            />
            Физическим лицам
          </label>
        </div>
        {errors.targetAudience && (
          <p className="error">{errors.targetAudience.message}</p>
        )}
      </div>

      {/* 2. Поля для бизнеса (показываются только если выбран бизнес) */}
      {targetAudience === 'business' && (
        <>
          <div className="form-section">
            <label htmlFor="companyName">Название компании или ИП*</label>
            <input
              id="companyName"
              type="text"
              {...register('companyName')}
              placeholder="Введите название компании или ИП"
            />
            {errors.companyName && (
              <p className="error">{errors.companyName.message}</p>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="inn">ИНН компании*</label>
            <input
              id="inn"
              type="text"
              {...register('inn')}
              placeholder="Введите ИНН компании"
            />
            {errors.inn && <p className="error">{errors.inn.message}</p>}
          </div>

          <div className="form-section">
            <label htmlFor="city">В каком городе вы ведёте бизнес?*</label>
            <input
              id="city"
              type="text"
              {...register('city')}
              placeholder="Введите город"
            />
            {errors.city && <p className="error">{errors.city.message}</p>}
          </div>
        </>
      )}

      {/* 3. Телефон (обязательное поле для всех) */}
      <div className="form-section">
        <label htmlFor="phone">Мобильный телефон*</label>
        <div className="phone-input">
          <span>+7</span>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="Введите номер мобильного телефона"
          />
        </div>
        {errors.phone && <p className="error">{errors.phone.message}</p>}
      </div>

      {/* 4. Согласие на обработку данных */}
      <div className="form-section agreement">
        <label>
          <input type="checkbox" {...register('agreement')} />
          Нажимая на кнопку «Отправить заявку», я соглашаюсь с условиями на
          передачу персональных данных.
        </label>
        {errors.agreement && (
          <p className="error">{errors.agreement.message}</p>
        )}
      </div>

      {/* 5. Кнопка отправки */}
      <button type="submit" className="submit-button">
        Отправить заявку
      </button>
    </form>
  );
};