import React, { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Схема валидации для SMS кода - 6 цифр
const smsCodeSchema = z.object({
  digit1: z.string().length(1, 'Введите одну цифру'),
  digit2: z.string().length(1, 'Введите одну цифру'),
  digit3: z.string().length(1, 'Введите одну цифру'),
  digit4: z.string().length(1, 'Введите одну цифру'),
  digit5: z.string().length(1, 'Введите одну цифру'),
  digit6: z.string().length(1, 'Введите одну цифру'),
});

type SmsCodeFormData = z.infer<typeof smsCodeSchema>;

interface SmsCodeInputProps {
  onCodeComplete: (code: string) => void;
}

export const SmsCodeInput: React.FC<SmsCodeInputProps> = ({ onCodeComplete }) => {
  // Рефы для доступа к инпутам
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Инициализация react-hook-form
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
      digit1: '', digit2: '', digit3: '', digit4: '', digit5: '', digit6: ''
    }
  });

  // Следим за всеми значениями полей
  const watchedValues = watch();

  // Автоматическая отправка когда все поля заполнены
  useEffect(() => {
    const smsCode = Object.values(watchedValues).join('');
    if (smsCode.length === 6 && /^\d+$/.test(smsCode)) {
      onCodeComplete(smsCode);
    }
  }, [watchedValues, onCodeComplete]);

  // Обработчик вставки текста
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text/plain').trim();
    
    // Оставляем только цифры и берем первые 6
    const digits = pastedText.replace(/\D/g, '').split('').slice(0, 6);
    
    if (digits.length > 0) {
      // Заполняем поля цифрами из буфера обмена
      digits.forEach((digit, index) => {
        const fieldName = `digit${index + 1}` as keyof SmsCodeFormData;
        setValue(fieldName, digit, { 
          shouldValidate: true,
          shouldDirty: true 
        });
      });
      
      // Очищаем оставшиеся поля если вставлено меньше 6 цифр
      for (let i = digits.length; i < 6; i++) {
        const fieldName = `digit${i + 1}` as keyof SmsCodeFormData;
        setValue(fieldName, '', { 
          shouldValidate: true,
          shouldDirty: true 
        });
      }
      
      // Ставим фокус на поле после последней вставленной цифры
      const nextFocusIndex = Math.min(digits.length, 5);
      setTimeout(() => {
        setFocus(`digit${nextFocusIndex + 1}` as keyof SmsCodeFormData);
      }, 10);
    }
  };

  // Обработчик ввода цифры
  const handleDigitInput = (
    event: React.FormEvent<HTMLInputElement>,
    fieldIndex: number
  ) => {
    const input = event.currentTarget;
    let inputValue = input.value;

    // Оставляем только цифры
    inputValue = inputValue.replace(/\D/g, '');

    if (inputValue.length > 0) {
      // Берем последнюю введенную цифру
      const digit = inputValue.slice(-1);
      const fieldName = `digit${fieldIndex + 1}` as keyof SmsCodeFormData;
      
      // Устанавливаем значение в форму
      setValue(fieldName, digit, { 
        shouldValidate: true,
        shouldDirty: true 
      });
      
      // Переходим к следующему полю если ввели цифру и это не последнее поле
      if (digit && fieldIndex < 5) {
        setTimeout(() => {
          setFocus(`digit${fieldIndex + 2}` as keyof SmsCodeFormData);
        }, 10);
      }
    } else {
      // Если поле очистили
      const fieldName = `digit${fieldIndex + 1}` as keyof SmsCodeFormData;
      setValue(fieldName, '', { 
        shouldValidate: true,
        shouldDirty: true 
      });
    }
  };

  // Обработчик нажатия клавиш
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    fieldIndex: number
  ) => {
    const input = event.currentTarget;
    
    // Обработка Backspace
    if (event.key === 'Backspace') {
      // Если поле пустое - переходим к предыдущему полю и очищаем его
      if (!input.value && fieldIndex > 0) {
        const prevFieldName = `digit${fieldIndex}` as keyof SmsCodeFormData;
        setValue(prevFieldName, '', { 
          shouldValidate: true,
          shouldDirty: true 
        });
        setTimeout(() => {
          setFocus(prevFieldName);
        }, 10);
      }
      // Если в поле есть значение - очищаем его
      else if (input.value) {
        const currentFieldName = `digit${fieldIndex + 1}` as keyof SmsCodeFormData;
        setValue(currentFieldName, '', { 
          shouldValidate: true,
          shouldDirty: true 
        });
      }
    }
    
    // Навигация стрелками влево/вправо
    else if (event.key === 'ArrowLeft' && fieldIndex > 0) {
      event.preventDefault();
      setTimeout(() => {
        setFocus(`digit${fieldIndex}` as keyof SmsCodeFormData);
      }, 10);
    } 
    else if (event.key === 'ArrowRight' && fieldIndex < 5) {
      event.preventDefault();
      setTimeout(() => {
        setFocus(`digit${fieldIndex + 2}` as keyof SmsCodeFormData);
      }, 10);
    }
    
    // Блокировка ввода не-цифр
    else if (event.key.length === 1 && !/\d/.test(event.key)) {
      event.preventDefault();
    }
  };

  // Выделение текста при фокусе для удобства замены
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  };

  // Ручная отправка формы (если нужна кнопка)
  const handleFormSubmit = (data: SmsCodeFormData) => {
    const smsCode = Object.values(data).join('');
    onCodeComplete(smsCode);
  };

  // Функция для регистрации поля с кастомным ref
  const registerField = (index: number) => {
    const fieldName = `digit${index + 1}` as keyof SmsCodeFormData;
    const { ref, ...rest } = register(fieldName);
    
    return {
      ...rest,
      ref: (element: HTMLInputElement | null) => {
        inputRefs.current[index] = element;
        ref(element);
      }
    };
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="sms-code-form">
      <div className="sms-inputs-container">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            className={`sms-code-input ${
              errors[`digit${index + 1}` as keyof SmsCodeFormData] ? 'input-error' : ''
            } ${
              watchedValues[`digit${index + 1}` as keyof SmsCodeFormData] ? 'input-filled' : ''
            }`}
            {...registerField(index)}
            onPaste={handlePaste}
            onInput={(event) => handleDigitInput(event, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onFocus={handleFocus}
            autoComplete="one-time-code"
            aria-label={`Цифра ${index + 1} SMS кода`}
          />
        ))}
      </div>
      
      {/* Скрытая кнопка submit для работы по Enter */}
      <button type="submit" style={{ display: 'none' }}>
        Подтвердить
      </button>

      <style jsx>{`
        .sms-code-form {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        
        .sms-inputs-container {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        
        .sms-code-input {
          width: 56px;
          height: 64px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          text-align: center;
          font-size: 24px;
          font-weight: 600;
          color: #1a202c;
          transition: all 0.2s ease-in-out;
          outline: none;
        }
        
        .sms-code-input:focus {
          border-color: #3182ce;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
          transform: translateY(-1px);
        }
        
        .sms-code-input.input-filled {
          border-color: #38a169;
          background-color: #f0fff4;
        }
        
        .sms-code-input.input-error {
          border-color: #e53e3e;
          background-color: #fed7d7;
        }
        
        .sms-code-input:hover {
          border-color: #cbd5e0;
        }
        
        /* Адаптивность для мобильных устройств */
        @media (max-width: 480px) {
          .sms-inputs-container {
            gap: 8px;
          }
          
          .sms-code-input {
            width: 48px;
            height: 56px;
            font-size: 20px;
          }
        }
        
        @media (max-width: 360px) {
          .sms-inputs-container {
            gap: 6px;
          }
          
          .sms-code-input {
            width: 44px;
            height: 52px;
            font-size: 18px;
          }
        }
      `}</style>
    </form>
  );
};