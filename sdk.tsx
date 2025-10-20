import React, { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Схема валидации с Zod
const smsCodeSchema = z.object({
  code0: z.string().length(1, 'Введите цифру'),
  code1: z.string().length(1, 'Введите цифру'),
  code2: z.string().length(1, 'Введите цифру'),
  code3: z.string().length(1, 'Введите цифру'),
  code4: z.string().length(1, 'Введите цифру'),
  code5: z.string().length(1, 'Введите цифру'),
});

type SmsCodeFormData = z.infer<typeof smsCodeSchema>;

interface SmsCodeFormProps {
  onCodeSubmit: (code: string) => void;
}

export const SmsCodeForm: React.FC<SmsCodeFormProps> = ({ onCodeSubmit }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SmsCodeFormData>({
    resolver: zodResolver(smsCodeSchema),
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Автоматическая отправка при заполнении всех полей
  useEffect(() => {
    const code = Object.values(watchedValues).join('');
    if (code.length === 6) {
      onCodeSubmit(code);
    }
  }, [watchedValues, onCodeSubmit]);

  // Обработчик изменения значения в инпуте
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    
    // Если вставлено несколько символов (paste)
    if (value.length > 1) {
      const digits = value.split('').slice(0, 6);
      digits.forEach((digit, digitIndex) => {
        if (digitIndex + index < 6) {
          setValue(`code${digitIndex + index}` as keyof SmsCodeFormData, digit);
        }
      });
      
      // Фокус на последний инпут
      const lastIndex = Math.min(index + digits.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    // Один символ - переходим к следующему инпуту
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Обработчик удаления (Backspace)
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Обработчик стрелок
  const handleArrowKey = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const onSubmit = (data: SmsCodeFormData) => {
    const code = Object.values(data).join('');
    onCodeSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="sms-code-form">
      <div className="sms-inputs-container">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            className={`sms-input ${errors[`code${index}` as keyof SmsCodeFormData] ? 'error' : ''}`}
            {...register(`code${index}` as keyof SmsCodeFormData)}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => {
              handleKeyDown(e, index);
              handleArrowKey(e, index);
            }}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      
      {/* Кнопка отправки (опционально) */}
      <button type="submit" className="submit-button">
        Подтвердить
      </button>
    </form>
  );
};
