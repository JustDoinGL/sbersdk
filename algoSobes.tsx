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
    setFocus,
    formState: { errors },
  } = useForm<SmsCodeFormData>({
    resolver: zodResolver(smsCodeSchema),
    mode: 'onChange',
    defaultValues: {
      code0: '', code1: '', code2: '', code3: '', code4: '', code5: ''
    }
  });

  const watchedValues = watch();

  // Автоматическая отправка при заполнении всех полей
  useEffect(() => {
    const code = Object.values(watchedValues).join('');
    if (code.length === 6 && /^\d+$/.test(code)) {
      onCodeSubmit(code);
    }
  }, [watchedValues, onCodeSubmit]);

  // Обработчик вставки текста
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Оставляем только цифры
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);
    
    if (digits.length > 0) {
      // Заполняем поля вставленными цифрами
      digits.forEach((digit, index) => {
        setValue(`code${index}` as keyof SmsCodeFormData, digit, {
          shouldValidate: true
        });
      });
      
      // Очищаем оставшиеся поля
      for (let i = digits.length; i < 6; i++) {
        setValue(`code${i}` as keyof SmsCodeFormData, '', {
          shouldValidate: true
        });
      }
      
      // Фокус на следующий после последнего заполненного поля
      const nextFocusIndex = Math.min(digits.length, 5);
      setTimeout(() => {
        setFocus(`code${nextFocusIndex}` as keyof SmsCodeFormData);
      }, 0);
    }
  };

  // Обработчик ввода символов
  const handleInput = (
    e: React.FormEvent<HTMLInputElement>,
    index: number
  ) => {
    const input = e.currentTarget;
    let value = input.value;

    // Оставляем только цифры
    value = value.replace(/\D/g, '');

    // Берем только последнюю цифру (если введено несколько)
    if (value.length > 0) {
      const digit = value.slice(-1);
      
      // Устанавливаем значение
      setValue(`code${index}` as keyof SmsCodeFormData, digit, {
        shouldValidate: true
      });
      
      // Переходим к следующему полю
      if (digit && index < 5) {
        setTimeout(() => {
          setFocus(`code${index + 1}` as keyof SmsCodeFormData);
        }, 0);
      }
    } else {
      // Если значение пустое, очищаем поле
      setValue(`code${index}` as keyof SmsCodeFormData, '', {
        shouldValidate: true
      });
    }
  };

  // Обработчик нажатия клавиш
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const input = e.currentTarget;
    
    if (e.key === 'Backspace') {
      // Если поле пустое и нажат Backspace - переходим к предыдущему полю и очищаем его
      if (!input.value && index > 0) {
        setValue(`code${index - 1}` as keyof SmsCodeFormData, '', {
          shouldValidate: true
        });
        setTimeout(() => {
          setFocus(`code${index - 1}` as keyof SmsCodeFormData);
        }, 0);
      }
      // Если в поле есть значение - очищаем его и остаемся в этом поле
      else if (input.value) {
        setValue(`code${index}` as keyof SmsCodeFormData, '', {
          shouldValidate: true
        });
      }
    }
    // Обработка стрелок
    else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setTimeout(() => {
        setFocus(`code${index - 1}` as keyof SmsCodeFormData);
      }, 0);
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      setTimeout(() => {
        setFocus(`code${index + 1}` as keyof SmsCodeFormData);
      }, 0);
    }
    // Блокировка букв и других символов
    else if (e.key.length === 1 && !/\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Обработчик фокуса - выделяем текст для перезаписи
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
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
            {...register(`code${index}` as keyof SmsCodeFormData, {
              onChange: (e) => handleInput(e, index)
            })}
            ref={(el) => {
              inputRefs.current[index] = el;
              // Регистрируем ref через react-hook-form
              register(`code${index}` as keyof SmsCodeFormData).ref(el);
            }}
            onPaste={handlePaste}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={handleFocus}
            autoComplete="one-time-code"
          />
        ))}
      </div>
      
      <button type="submit" className="submit-button">
        Подтвердить
      </button>
    </form>
  );
};