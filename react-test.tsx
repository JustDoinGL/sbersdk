import React, { useRef, useEffect, useCallback } from 'react';
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
    trigger,
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
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    console.log('Pasted data:', pastedData); // Для отладки
    
    // Оставляем только цифры
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);
    console.log('Digits after processing:', digits); // Для отладки
    
    if (digits.length > 0) {
      // Заполняем поля вставленными цифрами
      digits.forEach((digit, index) => {
        const fieldName = `code${index}` as keyof SmsCodeFormData;
        setValue(fieldName, digit, { 
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      });
      
      // Очищаем оставшиеся поля
      for (let i = digits.length; i < 6; i++) {
        const fieldName = `code${i}` as keyof SmsCodeFormData;
        setValue(fieldName, '', { 
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      }
      
      // Фокус на следующий после последнего заполненного поля
      const nextFocusIndex = Math.min(digits.length, 5);
      setTimeout(() => {
        setFocus(`code${nextFocusIndex}` as keyof SmsCodeFormData);
      }, 10);
      
      // Запускаем валидацию
      setTimeout(() => {
        trigger();
      }, 20);
    }
  }, [setValue, setFocus, trigger]);

  // Обработчик изменения input
  const handleInputChange = useCallback((
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
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      
      // Переходим к следующему полю
      if (digit && index < 5) {
        setTimeout(() => {
          setFocus(`code${index + 1}` as keyof SmsCodeFormData);
        }, 10);
      }
    } else {
      // Если значение пустое, очищаем поле
      setValue(`code${index}` as keyof SmsCodeFormData, '', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }
  }, [setValue, setFocus]);

  // Обработчик нажатия клавиш
  const handleKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const input = e.currentTarget;
    
    if (e.key === 'Backspace') {
      // Если поле пустое и нажат Backspace - переходим к предыдущему полю и очищаем его
      if (!input.value && index > 0) {
        setValue(`code${index - 1}` as keyof SmsCodeFormData, '', {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
        setTimeout(() => {
          setFocus(`code${index - 1}` as keyof SmsCodeFormData);
        }, 10);
      }
      // Если в поле есть значение - очищаем его и остаемся в этом поле
      else if (input.value) {
        setValue(`code${index}` as keyof SmsCodeFormData, '', {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      }
    }
    // Обработка стрелок
    else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setTimeout(() => {
        setFocus(`code${index - 1}` as keyof SmsCodeFormData);
      }, 10);
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      setTimeout(() => {
        setFocus(`code${index + 1}` as keyof SmsCodeFormData);
      }, 10);
    }
    // Блокировка букв и других символов
    else if (e.key.length === 1 && !/\d/.test(e.key)) {
      e.preventDefault();
    }
  }, [setValue, setFocus]);

  // Обработчик фокуса - выделяем текст для перезаписи
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  }, []);

  const onSubmit = (data: SmsCodeFormData) => {
    const code = Object.values(data).join('');
    onCodeSubmit(code);
  };

  // Регистрируем поля без использования register в ref
  const registerField = useCallback((index: number) => {
    const fieldName = `code${index}` as keyof SmsCodeFormData;
    const { ref, ...rest } = register(fieldName);
    
    return {
      ...rest,
      ref: (el: HTMLInputElement | null) => {
        inputRefs.current[index] = el;
        ref(el);
      }
    };
  }, [register]);

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
            {...registerField(index)}
            onPaste={handlePaste}
            onInput={(e) => handleInputChange(e, index)}
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