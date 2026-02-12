import { useMaskito } from '@maskito/react';
import { forwardRef, useRef, useEffect } from 'react';
import type { MaskitoOptions } from '@maskito/core';

// Твои маски из файла
const MASKS = {
  licensePlate: {
    mask: (v: string): string => {
      const value = v.replace(/\s/g, '').toUpperCase();
      if (!value) return '';
      
      let result = value[0];
      if (value.length > 1) result += value.slice(1, 4);
      if (value.length > 4) result += ' ' + value.slice(4, 6);
      if (value.length > 6) result += ' ' + value.slice(6);
      
      return result;
    },
    unmask: (v: string): string => v.replace(/\s/g, ''),
    maskitoOptions: (): MaskitoOptions => ({
      mask: /^[А-ЯA-Z0-9\s]{0,9}$/,
      preprocessors: [
        ({ elementState, data }) => ({
          elementState: {
            value: elementState.value.toUpperCase(),
            selection: elementState.selection,
          },
          data: data.toUpperCase(),
        }),
      ],
    }),
  },
  
  departmentCode: {
    mask: (v: string): string => {
      const cleaned = v.replace(/[^\dA-Z]/gi, '').toUpperCase();
      if (cleaned.length <= 2) return cleaned;
      return cleaned.slice(0, 2) + '-' + cleaned.slice(2, 7);
    },
    unmask: (v: string): string => v.replace(/[^\dA-Z]/gi, '').toUpperCase(),
    maskitoOptions: (): MaskitoOptions => ({
      mask: /^[\dA-Z]{0,2}-?[\dA-Z]{0,5}$/i,
      preprocessors: [
        ({ elementState, data }) => ({
          elementState: {
            value: elementState.value.toUpperCase(),
            selection: elementState.selection,
          },
          data: data.toUpperCase(),
        }),
      ],
    }),
  }
};

// Кастомный инпут с Maskito
export const MaskedInput = forwardRef(({ 
  mask, 
  value = '', 
  onChange,
  onBlur,
  hasError,
  errorMessage,
  className,
  ...props 
}, ref) => {
  const inputRef = useRef(null);
  
  // Берем maskitoOptions из твоих масок
  const maskitoOptions = MASKS[mask]?.maskitoOptions?.();
  
  // Используем хук из @maskito/react
  const maskitoRef = useMaskito({
    options: maskitoOptions,
    elementPredicate: (host) => host.querySelector('input') ?? host,
  });

  // Объединяем рефы
  const setRefs = (element) => {
    inputRef.current = element;
    maskitoRef(element);
    
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

  // Обработчик изменений
  const handleInput = (e) => {
    const rawValue = e.target.value;
    if (onChange) {
      const unmasked = MASKS[mask].unmask(rawValue);
      onChange(unmasked);
    }
  };

  // Форматируем отображаемое значение
  const displayValue = value ? MASKS[mask].mask(value) : '';

  return (
    <div className={className}>
      <input
        {...props}
        ref={setRefs}
        value={displayValue}
        onInput={handleInput}
        onBlur={(e) => {
          const val = e.target.value;
          if (onBlur) {
            const unmasked = MASKS[mask].unmask(val.trim());
            onBlur(e, unmasked);
          }
        }}
        data-error={hasError}
      />
      {hasError && errorMessage && (
        <span className="error-message">{errorMessage}</span>
      )}
    </div>
  );
});

// Подключение к react-hook-form
export const FormMaskedInput = ({ 
  field, 
  fieldState, 
  mask, 
  onBlur,
  ...props 
}) => {
  return (
    <MaskedInput
      {...props}
      mask={mask}
      value={field.value}
      onChange={field.onChange}
      onBlur={(e, unmasked) => {
        field.onBlur();
        if (onBlur) {
          onBlur(e, unmasked);
        }
      }}
      hasError={!!fieldState.error}
      errorMessage={fieldState.error?.message}
    />
  );
};