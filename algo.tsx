import React, { useRef, useEffect, useState, KeyboardEvent, ClipboardEvent, FormEvent } from 'react';

interface SmsCodeInputProps {
  onCodeComplete: (code: string) => void;
}

export const SmsCodeInput: React.FC<SmsCodeInputProps> = ({ onCodeComplete }) => {
  // Рефы для доступа к DOM элементам инпутов
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Состояние для хранения значений всех полей
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  
  // Состояние для ошибок валидации
  const [errors, setErrors] = useState<boolean[]>(Array(6).fill(false));

  // Проверка валидации всех полей
  const validateAllFields = (values: string[]): boolean[] => {
    return values.map(value => value.length !== 1);
  };

  // Автоматическая отправка когда все 6 полей заполнены цифрами
  useEffect(() => {
    const isComplete = digits.every(digit => digit.length === 1);
    if (isComplete) {
      const smsCode = digits.join('');
      onCodeComplete(smsCode);
    }
    
    // Обновляем состояния ошибок
    const newErrors = validateAllFields(digits);
    setErrors(newErrors);
  }, [digits, onCodeComplete]);

  // Обновление значения в конкретном поле
  const updateDigit = (index: number, value: string) => {
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
  };

  // Обработчик вставки текста из буфера обмена
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text/plain').trim();
    
    // Оставляем только цифры и берем первые 6
    const pastedDigits = pastedText.replace(/\D/g, '').split('').slice(0, 6);
    
    if (pastedDigits.length > 0) {
      const newDigits = [...digits];
      
      // Заполняем поля цифрами из буфера обмена
      pastedDigits.forEach((digit, index) => {
        newDigits[index] = digit;
        // Обновляем DOM
        if (inputRefs.current[index]) {
          inputRefs.current[index]!.value = digit;
        }
      });
      
      // Очищаем оставшиеся поля если вставлено меньше 6 цифр
      for (let i = pastedDigits.length; i < 6; i++) {
        newDigits[i] = '';
        if (inputRefs.current[i]) {
          inputRefs.current[i]!.value = '';
        }
      }
      
      setDigits(newDigits);
      
      // Ставим фокус на поле после последней вставленной цифры
      const nextFocusIndex = Math.min(pastedDigits.length, 5);
      setTimeout(() => {
        inputRefs.current[nextFocusIndex]?.focus();
      }, 10);
    }
  };

  // Обработчик ввода цифры в поле
  const handleDigitInput = (index: number, event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    let inputValue = input.value;

    // Оставляем только цифры
    inputValue = inputValue.replace(/\D/g, '');

    if (inputValue.length > 0) {
      // Берем последнюю введенную цифру
      const digit = inputValue.slice(-1);
      
      // Обновляем значение в состоянии
      updateDigit(index, digit);
      
      // Принудительно обновляем значение в DOM
      input.value = digit;
      
      // Переходим к следующему полю если ввели цифру и это не последнее поле
      if (digit && index < 5) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 10);
      }
    } else {
      // Если поле очистили
      updateDigit(index, '');
    }
  };

  // Обработчик нажатия клавиш на клавиатуре
  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    
    // Обработка клавиши Backspace
    if (event.key === 'Backspace') {
      // Если поле пустое - переходим к предыдущему полю и очищаем его
      if (!input.value && index > 0) {
        updateDigit(index - 1, '');
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1]!.value = '';
        }
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 10);
      }
      // Если в поле есть значение - очищаем его
      else if (input.value) {
        updateDigit(index, '');
      }
      event.preventDefault();
    }
    
    // Навигация стрелками влево/вправо
    else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 10);
    } 
    else if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }
    
    // Замена цифры если поле уже заполнено
    else if (digits[index] && /\d/.test(event.key)) {
      updateDigit(index, event.key);
      input.value = event.key;
      
      // Переходим к следующему полю после замены
      if (index < 5) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 10);
      }
      event.preventDefault();
    }
    
    // Блокировка ввода не-цифр
    else if (event.key.length === 1 && !/\d/.test(event.key)) {
      event.preventDefault();
    }
  };

  // Выделение текста при фокусе для удобства замены
  const handleFocus = (event: FormEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  };

  // Обработчик клика для выделения текста в заполненном поле
  const handleClick = (index: number, event: React.MouseEvent<HTMLInputElement>) => {
    if (digits[index]) {
      event.currentTarget.select();
    }
  };

  return (
    <div className="sms-code-container">
      <div className="sms-inputs-grid">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={element => inputRefs.current[index] = element}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            className={`sms-code-input ${errors[index] ? 'input-error' : ''} ${digit ? 'input-filled' : ''}`}
            onPaste={handlePaste}
            onInput={(event) => handleDigitInput(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={handleFocus}
            onClick={(event) => handleClick(index, event)}
            autoComplete="one-time-code"
            aria-label={`Цифра ${index + 1} из 6 для SMS подтверждения`}
          />
        ))}
      </div>

      <style jsx>{`
        .sms-code-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 16px;
        }
        
        .sms-inputs-grid {
          display: flex;
          gap: 12px;
          justify-content: center;
          align-items: center;
        }
        
        .sms-code-input {
          width: 54px;
          height: 62px;
          border: 2px solid #d1d5db;
          border-radius: 12px;
          background: #ffffff;
          text-align: center;
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          transition: all 0.2s ease-in-out;
          outline: none;
          font-family: monospace;
        }
        
        .sms-code-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          transform: translateY(-2px);
        }
        
        .sms-code-input.input-filled {
          border-color: #10b981;
          background-color: #f0fdf4;
        }
        
        .sms-code-input.input-error {
          border-color: #ef4444;
          background-color: #fef2f2;
        }
        
        .sms-code-input:hover {
          border-color: #9ca3af;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        /* Анимация пульсации когда все поля заполнены */
        .sms-inputs-grid:has(.sms-code-input.input-filled:nth-child(6)) .sms-code-input {
          animation: pulse-gentle 0.6s ease-in-out;
        }
        
        @keyframes pulse-gentle {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        /* Адаптивность для мобильных устройств */
        @media (max-width: 480px) {
          .sms-inputs-grid {
            gap: 8px;
          }
          
          .sms-code-input {
            width: 46px;
            height: 54px;
            font-size: 20px;
            border-radius: 10px;
          }
        }
        
        @media (max-width: 360px) {
          .sms-inputs-grid {
            gap: 6px;
          }
          
          .sms-code-input {
            width: 42px;
            height: 50px;
            font-size: 18px;
            border-radius: 8px;
          }
        }
        
        /* Поддержка темной темы */
        @media (prefers-color-scheme: dark) {
          .sms-code-input {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }
          
          .sms-code-input.input-filled {
            background-color: #064e3b;
            border-color: #047857;
          }
          
          .sms-code-input.input-error {
            background-color: #7f1d1d;
            border-color: #dc2626;
          }
        }
      `}</style>
    </div>
  );
};