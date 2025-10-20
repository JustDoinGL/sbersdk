import React, { useRef, useState, useCallback } from 'react';

export const useSmsCode = (length: number = 6) => {
  const [codes, setCodes] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateCode = useCallback((index: number, value: string) => {
    setCodes(prev => {
      const newCodes = [...prev];
      newCodes[index] = value;
      return newCodes;
    });
  }, []);

  const clearCodes = useCallback(() => {
    setCodes(Array(length).fill(''));
  }, [length]);

  const getFullCode = useCallback(() => {
    return codes.join('');
  }, [codes]);

  return {
    codes,
    inputRefs,
    updateCode,
    clearCodes,
    getFullCode
  };
};

export const SmsCodeForm: React.FC<SmsCodeFormProps> = ({ onCodeSubmit }) => {
  const { codes, inputRefs, updateCode } = useSmsCode(6);

  const handleInput = useCallback((index: number, e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    let value = input.value;
    
    // Очищаем и берем последнюю цифру
    value = value.replace(/\D/g, '');
    if (value.length > 0) {
      value = value.slice(-1);
    }
    
    // Принудительно обновляем DOM
    input.value = value;
    
    // Обновляем состояние
    updateCode(index, value);
    
    // Авто-отправка при полном заполнении
    const fullCode = [...codes.slice(0, index), value, ...codes.slice(index + 1)].join('');
    if (fullCode.length === 6 && /^\d+$/.test(fullCode)) {
      onCodeSubmit(fullCode);
    }
    
    // Авто-фокус на следующее поле
    if (value && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }
  }, [codes, updateCode, onCodeSubmit]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);
    
    digits.forEach((digit, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index]!.value = digit;
      }
      updateCode(index, digit);
    });
    
    const fullCode = digits.join('');
    if (fullCode.length === 6) {
      onCodeSubmit(fullCode);
    }
    
    const nextIndex = Math.min(digits.length, 5);
    setTimeout(() => {
      inputRefs.current[nextIndex]?.focus();
    }, 10);
  }, [updateCode, onCodeSubmit]);

  return (
    <div className="sms-inputs-container">
      {codes.map((code, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          value={code}
          onInput={(e) => handleInput(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="sms-input"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};