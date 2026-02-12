// useMaskito.ts
import { useEffect, useRef, useState, useCallback } from 'react';

// Функция адаптации для React контролируемых инпутов (из твоего файла)
function adaptReactControlledElement(element) {
  const getPrototype = (el) => {
    switch (el.nodeName) {
      case 'INPUT':
        return window.HTMLInputElement?.prototype;
      case 'TEXTAREA':
        return window.HTMLTextAreaElement?.prototype;
      default:
        return null;
    }
  };

  const valueSetter = Object.getOwnPropertyDescriptor(
    getPrototype(element),
    'value'
  )?.set;

  if (!valueSetter) return element;

  const adapter = {
    set value(value) {
      // Обходим React патчинг
      valueSetter.call(element, value);
    },
  };

  return new Proxy(element, {
    get(target, prop) {
      const nativeProperty = target[prop];
      return typeof nativeProperty === 'function'
        ? nativeProperty.bind(target)
        : nativeProperty;
    },
    set(target, prop, val, receiver) {
      return Reflect.set(prop in adapter ? adapter : target, prop, val, receiver);
    },
  });
}

// Наш кастомный хук для масок
export function useMaskito({ 
  mask, 
  unmask, 
  format, // функция форматирования
  pattern, // регулярка для валидации ввода
  placeholderChar = ' ' 
}) {
  const elementRef = useRef(null);
  const [maskedElement, setMaskedElement] = useState(null);
  
  // Сохраняем позицию курсора
  const cursorPositionRef = useRef(0);
  const oldValueRef = useRef('');

  // Функция для установки позиции курсора
  const setCursorPosition = (el, pos) => {
    if (el && el.setSelectionRange) {
      setTimeout(() => {
        try {
          el.setSelectionRange(pos, pos);
        } catch (e) {
          console.warn('Failed to set cursor position:', e);
        }
      }, 0);
    }
  };

  // Обработчик ввода
  const handleInput = useCallback((e) => {
    const input = e.target;
    const cursorPos = input.selectionStart;
    const oldValue = oldValueRef.current;
    const newValue = input.value;
    
    // Сохраняем текущую позицию
    cursorPositionRef.current = cursorPos;
    
    // Получаем значение без маски
    let rawValue = unmask ? unmask(newValue) : newValue;
    
    // Применяем маску
    let maskedValue = mask ? mask(rawValue) : rawValue;
    
    // Обновляем значение в input через адаптер
    if (input !== maskedElement) {
      const adapted = adaptReactControlledElement(input);
      adapted.value = maskedValue;
    } else {
      input.value = maskedValue;
    }
    
    // Восстанавливаем позицию курсора
    let newCursorPos = cursorPos;
    
    if (newValue.length > oldValue.length) {
      // Добавление символа
      newCursorPos = Math.min(cursorPos + 1, maskedValue.length);
    } else if (newValue.length < oldValue.length) {
      // Удаление символа
      newCursorPos = Math.max(0, cursorPos);
      
      // Проверяем, не удалили ли мы разделитель
      if (oldValue[cursorPos] === placeholderChar || oldValue[cursorPos] === '-') {
        newCursorPos = Math.max(0, cursorPos - 1);
      }
    }
    
    setCursorPosition(input, newCursorPos);
    oldValueRef.current = maskedValue;
    
    // Возвращаем сырое значение для onChange
    return rawValue;
  }, [mask, unmask, placeholderChar, maskedElement]);

  // Обработчик вставки
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const input = e.target;
    const cursorPos = input.selectionStart;
    const currentValue = input.value;
    
    // Получаем сырое значение
    let rawCurrent = unmask ? unmask(currentValue) : currentValue;
    
    // Вставляем текст в позицию курсора
    let newRawValue = rawCurrent.slice(0, cursorPos) + 
                     pastedText + 
                     rawCurrent.slice(cursorPos);
    
    // Очищаем от лишних символов
    if (pattern) {
      newRawValue = newRawValue.replace(new RegExp(`[^${pattern}]`, 'g'), '');
    }
    
    // Применяем маску
    const maskedValue = mask ? mask(newRawValue) : newRawValue;
    
    if (input !== maskedElement) {
      const adapted = adaptReactControlledElement(input);
      adapted.value = maskedValue;
    } else {
      input.value = maskedValue;
    }
    
    // Устанавливаем курсор после вставленного текста
    const newCursorPos = Math.min(
      cursorPos + pastedText.length,
      maskedValue.length
    );
    setCursorPosition(input, newCursorPos);
    oldValueRef.current = maskedValue;
    
    // Возвращаем сырое значение
    return newRawValue;
  }, [mask, unmask, pattern, maskedElement]);

  // Обработчик клавиш
  const handleKeyDown = useCallback((e) => {
    const input = e.target;
    
    // Запоминаем позицию курсора
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
        e.key === 'Home' || e.key === 'End') {
      setTimeout(() => {
        cursorPositionRef.current = input.selectionStart;
      }, 0);
    }
    
    // Обработка Backspace
    if (e.key === 'Backspace') {
      const cursorPos = input.selectionStart;
      const currentValue = input.value;
      
      // Если курсор на разделителе - удаляем предыдущий символ
      if (currentValue[cursorPos - 1] === placeholderChar ||
          currentValue[cursorPos - 1] === '-') {
        e.preventDefault();
        
        const rawValue = unmask ? unmask(currentValue) : currentValue;
        let newRawValue;
        
        if (cursorPos > 1) {
          newRawValue = rawValue.slice(0, cursorPos - 2) + rawValue.slice(cursorPos - 1);
        } else {
          newRawValue = rawValue.slice(0, cursorPos - 1) + rawValue.slice(cursorPos);
        }
        
        const maskedValue = mask ? mask(newRawValue) : newRawValue;
        
        if (input !== maskedElement) {
          const adapted = adaptReactControlledElement(input);
          adapted.value = maskedValue;
        } else {
          input.value = maskedValue;
        }
        
        setCursorPosition(input, Math.max(0, cursorPos - 1));
        oldValueRef.current = maskedValue;
      }
    }
  }, [mask, unmask, placeholderChar, maskedElement]);

  // Реф колбек для привязки к элементу
  const ref = useCallback((node) => {
    if (node) {
      const input = node.tagName === 'INPUT' ? node : node.querySelector('input');
      
      if (input) {
        elementRef.current = input;
        
        // Адаптируем элемент для React
        const adapted = adaptReactControlledElement(input);
        setMaskedElement(adapted);
        
        // Навешиваем обработчики
        input.addEventListener('input', handleInput);
        input.addEventListener('keydown', handleKeyDown);
        input.addEventListener('paste', handlePaste);
      }
    } else {
      // Убираем обработчики при размонтировании
      if (elementRef.current) {
        const input = elementRef.current;
        input.removeEventListener('input', handleInput);
        input.removeEventListener('keydown', handleKeyDown);
        input.removeEventListener('paste', handlePaste);
        elementRef.current = null;
        setMaskedElement(null);
      }
    }
  }, [handleInput, handleKeyDown, handlePaste]);

  // Эффект для обновления значения
  useEffect(() => {
    if (elementRef.current && mask) {
      const input = elementRef.current;
      const currentValue = input.value;
      const rawValue = unmask ? unmask(currentValue) : currentValue;
      const maskedValue = mask(rawValue);
      
      if (currentValue !== maskedValue) {
        if (input !== maskedElement) {
          const adapted = adaptReactControlledElement(input);
          adapted.value = maskedValue;
        } else {
          input.value = maskedValue;
        }
        oldValueRef.current = maskedValue;
      }
    }
  }, [mask, unmask, maskedElement]);

  return ref;
}




import { useMaskito } from './useMaskito';

// Твои маски
const masks = {
  licensePlate: {
    mask: (v) => {
      const value = v.replace(/\s/g, '').toUpperCase();
      if (!value) return '';
      
      let result = value[0];
      if (value.length > 1) result += value.slice(1, 4);
      if (value.length > 4) result += ' ' + value.slice(4, 6);
      if (value.length > 6) result += ' ' + value.slice(6);
      
      return result;
    },
    unmask: (v) => v.replace(/\s/g, ''),
    pattern: 'А-ЯA-Z0-9',
  },
  
  departmentCode: {
    mask: (v) => {
      const cleaned = v.replace(/[^\dA-Z]/gi, '').toUpperCase();
      if (cleaned.length <= 2) return cleaned;
      return cleaned.slice(0, 2) + '-' + cleaned.slice(2, 7);
    },
    unmask: (v) => v.replace(/[^\dA-Z]/gi, '').toUpperCase(),
    pattern: '\\dA-Z',
  }
};

// В твоем компоненте:
function YourComponent({ field, mask, ...props }) {
  const currentMask = masks[mask];
  
  const maskitoRef = useMaskito({
    mask: currentMask.mask,
    unmask: currentMask.unmask,
    pattern: currentMask.pattern,
    placeholderChar: mask === 'licensePlate' ? ' ' : '-'
  });

  return (
    <div className={wrapperClassName}>
      <Input
        {...props}
        {...field}
        ref={(el) => {
          if (el) {
            const input = el.tagName === 'INPUT' ? el : el.querySelector('input');
            maskitoRef(input?.parentElement || el);
            if (field.ref) field.ref(input || el);
          }
        }}
        onInput={(e) => {
          const rawValue = currentMask.unmask(e.target.value);
          field.onChange(rawValue);
        }}
        onBlur={(e) => {
          const value = e.target.value;
          field.onChange(currentMask.unmask(value.trim()));
          props.onBlur?.();
        }}
        value={currentMask.mask(field.value ?? '')}
        hasError={!IFieldState.error}
      />
      {fieldState.error?.message && (
        <ErrorMessage message={errorMessage ?? fieldState.error?.message} />
      )}
    </div>
  );
}


