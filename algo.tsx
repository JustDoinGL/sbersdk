// hooks/useLicensePlateMask.ts
import { useState, useCallback } from 'react';

export const useLicensePlateMask = (defaultValue = '') => {
  const [displayValue, setDisplayValue] = useState(
    defaultValue ? formatLicensePlate(defaultValue) : ''
  );

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatLicensePlate(inputValue);
    setDisplayValue(formatted);
    
    // Возвращаем очищенное значение для формы
    return cleanLicensePlate(inputValue);
  }, []);

  const onBlur = useCallback((value: string) => {
    // Можно добавить дополнительные проверки при потере фокуса
    if (value && value.length < 9) {
      console.warn('Неполный номер');
    }
  }, []);

  return {
    displayValue,
    onChange,
    onBlur,
    setDisplayValue,
  };
};

// Компонент с использованием хука
export const AutoStateNumberInputV2 = <T extends FieldValues>({
  name,
  control,
  ...props
}: AutoStateNumberInputProps<T>) => {
  const licensePlateMask = useLicensePlateMask();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const cleanedValue = licensePlateMask.onChange(e);
          field.onChange(cleanedValue);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          licensePlateMask.onBlur(cleanLicensePlate(e.target.value));
          field.onBlur();
        };

        return (
          <Input
            {...field}
            {...props}
            value={licensePlateMask.displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );
      }}
    />
  );
};