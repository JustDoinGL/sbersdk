import React, { useState, useMemo } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Autocomplete } from '@your-ui-kit/autocomplete';
import { ErrorMessage } from '@your-ui-kit/error-message';
import { Show } from '@your-ui-kit/show';

// Типизация пропсов
type Props<T extends FieldValues, K extends Path<T>> = {
  name: K;
  control: Control<T>;
  product: string;
  code: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};

// Сырой тип из справочника
type ReferenceDto = {
  name: string;
  slug: string;
  someSubtitle?: string; // Пример доп. поля для JSX
};

// Тип опции (value - строка, label - JSX)
type AutoCompleteOption = {
  value: string;
  label: React.ReactNode;
  origin: ReferenceDto; // Исходные данные для показа в инпуте
};

export const DictionarySearchSelect = <T extends FieldValues, K extends Path<T>>({
  name,
  control,
  product,
  code,
  label,
  placeholder,
  disabled,
}: Props<T, K>) => {
  // Локальный стейт ТОЛЬКО для строки ввода (чтобы показывать name в инпуте)
  const [inputValue, setInputValue] = useState('');
  
  const [debouncedQuery] = useDebounce(inputValue, 500);

  // 1. Запрос к API
  const fetchData = async (signal: AbortSignal): Promise<ReferenceDto[]> => {
    const res = await apiMortgage.getReferences({
      dictNames: ["mortgage_mortgage_insurer"],
      search: debouncedQuery.trim() || undefined,
    }, { signal });
    
    return res.mortgage_mortgage_insurer ?? [];
  };

  // 2. Query с маппингом в JSX label
  const { data: options = [], isLoading, isError } = useQuery({
    queryKey: ["dictionary", product, code, debouncedQuery],
    queryFn: ({ signal }) => fetchData(signal),
    enabled: !!debouncedQuery,
    select: (rawData) => {
      return rawData.map((dto: ReferenceDto): AutoCompleteOption => ({
        value: dto.slug,
        label: (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>{dto.name}</span>
            {dto.someSubtitle && (
              <span style={{ fontSize: '0.8em', color: '#888' }}>
                {dto.someSubtitle}
              </span>
            )}
          </div>
        ),
        origin: dto,
      }));
    },
  });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        // Находим выбранную опцию по текущему значению формы (field.value)
        const selectedOption = useMemo(() => {
          return options.find((opt) => opt.value === field.value) || null;
        }, [options, field.value]);

        // Синхронизируем inputValue, если значение в форме изменилось извне (например, reset)
        // Это делается через useEffect, но чтобы не усложнять, можно полагаться на onSelect
        // Если нужен полный контроль, раскомментируй:
        /*
        useEffect(() => {
          if (selectedOption) {
            setInputValue(selectedOption.origin.name);
          } else if (!field.value) {
            setInputValue('');
          }
        }, [field.value, selectedOption]);
        */

        // Обработка ввода текста
        const handleInputChange = (value: string) => {
          setInputValue(value);
          // Если пользователь стирает текст, очищаем значение в форме
          if (!value) {
            field.onChange('');
          }
        };

        // Обработка выбора из списка
        const handleSelect = (option: AutoCompleteOption) => {
          setInputValue(option.origin.name); // Показываем name в инпуте
          field.onChange(option.value); // В форму уходит slug!
        };

        return (
          <div>
            <Autocomplete
              label={label || "Спорт"}
              placeholder={placeholder || "Выберите"}
              value={inputValue}
              onChange={handleInputChange}
              options={options}
              // Указываем, какую строку показывать в инпуте при выборе
              getOptionLabel={(option: AutoCompleteOption) => option.origin.name}
              // Рендер опции в выпадающем списке (если кит требует отдельный рендер)
              renderOption={(props, option) => (
                <li {...props} key={option.value}>
                  {option.label}
                </li>
              )}
              onSelect={handleSelect}
              isLoading={isLoading}
              hasError={isError || !!fieldState.error}
              disabled={disabled}
            />
            
            <Show when={fieldState.error?.message}>
              {(message) => <ErrorMessage message={message} />}
            </Show>
          </div>
        );
      }}
    />
  );
};