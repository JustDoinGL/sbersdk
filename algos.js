import React, { useRef, useEffect, useState } from 'react';

export const SmsCodeForm = ({ onCodeSubmit }) => {
  const refs = useRef([]);
  const [vals, setVals] = useState(Array(6).fill(''));

  useEffect(() => {
    const code = vals.join('');
    if (code.length === 6 && /^\d{6}$/.test(code)) {
      onCodeSubmit(code);
    }
  }, [vals, onCodeSubmit]);

  const paste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').slice(0, 6).split('');
    
    const newVals = Array(6).fill('');
    digits.forEach((digit, i) => {
      newVals[i] = digit;
    });
    
    // Обновляем DOM
    newVals.forEach((val, i) => {
      if (refs.current[i]) {
        refs.current[i].value = val;
      }
    });
    
    // Обновляем состояние
    setVals(newVals);
    
    // Фокус на следующее поле после вставки
    const nextFocusIndex = Math.min(digits.length, 5);
    setTimeout(() => refs.current[nextFocusIndex]?.focus(), 0);
  };

  const input = (index, e) => {
    const input = e.currentTarget;
    const value = input.value;
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newVals = [...vals];
    
    if (digit) {
      newVals[index] = digit;
      input.value = digit; // Принудительно устанавливаем значение
      setVals(newVals);
      
      // Переход вперед если ввели цифру
      if (index < 5) {
        setTimeout(() => refs.current[index + 1]?.focus(), 0);
      }
    } else {
      // Если очистили поле
      newVals[index] = '';
      setVals(newVals);
    }
  };

  const keydown = (index, e) => {
    // Навигация стрелками
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setTimeout(() => refs.current[index - 1]?.focus(), 0);
      return;
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      setTimeout(() => refs.current[index + 1]?.focus(), 0);
      return;
    }

    // Backspace
    if (e.key === 'Backspace') {
      if (!vals[index] && index > 0) {
        // Если поле пустое - очищаем предыдущее и переходим к нему
        const newVals = [...vals];
        newVals[index - 1] = '';
        if (refs.current[index - 1]) {
          refs.current[index - 1].value = '';
        }
        setVals(newVals);
        setTimeout(() => {
          refs.current[index - 1]?.focus();
        }, 0);
      } else if (vals[index]) {
        // Если в поле есть значение - очищаем его но остаемся в нем
        const newVals = [...vals];
        newVals[index] = '';
        e.currentTarget.value = '';
        setVals(newVals);
      }
      e.preventDefault(); // Предотвращаем стандартное поведение Backspace
      return;
    }

    // Если поле уже заполнено и пользователь вводит новую цифру - заменяем
    if (vals[index] && /\d/.test(e.key)) {
      const newVals = [...vals];
      newVals[index] = e.key;
      e.currentTarget.value = e.key;
      setVals(newVals);
      
      // Автопереход к следующему полю после замены
      if (index < 5) {
        setTimeout(() => refs.current[index + 1]?.focus(), 0);
      }
      e.preventDefault();
      return;
    }

    // Блокировка не-цифр
    if (e.key.length === 1 && !/\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Обработчик клика - если поле заполнено, выделяем текст для замены
  const handleClick = (index, e) => {
    if (vals[index]) {
      e.target.select();
    }
  };

  return (
    <div className="sms-inputs-container">
      {vals.map((_, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          onPaste={paste}
          onInput={(e) => input(i, e)}
          onKeyDown={(e) => keydown(i, e)}
          onFocus={e => e.target.select()}
          onClick={(e) => handleClick(i, e)}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};