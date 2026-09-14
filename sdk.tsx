import React, { useState } from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { ControlledMultiselect } from "@/5_shared/ui";
import { dictionariesApi } from "@products/domain/shared/5_api";
import { Option } from "@sg/uikit";

// ==========================================
// 1. ТИПЫ ДЛЯ ПРОДУКТА И КОДА
// ==========================================

// Карта: продукт -> доступные коды
export type ProductCodeMap = {
  accidents: 'professions' | 'sports';
  auto: 'brands' | 'models';
};

// Тип продукта (вытаскивается автоматически из ключей карты)
export type PRODUCT = keyof ProductCodeMap;

// ==========================================
// 2. ТИП ПРОПСОВ (Abort Controller тут)
// ==========================================

type Props<
  FormData extends FieldValues,
  T extends PRODUCT,
  K extends ProductCodeMap[T]
> = {
  control: Control<FormData>;
  name: Path<FormData>;
  product: T;
  code: K;
  wrapperClassName?: string;
} & Omit<React.ComponentProps<typeof ControlledMultiselect>, 'options' | 'onInputChange' | 'control' | 'name'>;

// ==========================================
// 3. САМ КОМПОНЕНТ
// ==========================================

export const DictionaryMultiSelect = <
  FormData extends FieldValues,
  T extends PRODUCT,
  K extends ProductCodeMap[T]
>({
  control,
  name,
  product,
  code,
  ...rest
}: Props<FormData, T, K>) => {
  const [options, setOptions] = useState<Option<string>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Дебаунс-таймер прямо в замыкании handleChange
  const handleChange = (() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // AbortController для отмены предыдущего запроса
    let abortController: AbortController | null = null;

    return async (query: string) => {
      // 1. Сбрасываем предыдущий таймер
      clearTimeout(timeoutId);
      
      // 2. Отменяем предыдущий запрос (если он был)
      if (abortController) {
        abortController.abort();
      }

      // 3. Ставим новый таймер на 500мс
      timeoutId = setTimeout(async () => {
        if (!query.trim()) {
          setOptions([]);
          return;
        }

        setIsLoading(true);
        abortController = new AbortController();

        try {
          // Тут ваш реальный вызов API
          const response = await dictionariesApi.searchDictionary(product, {
            code,
            query,
          });

          // Проверяем, не отменен ли запрос, пока он летел
          if (!abortController.signal.aborted) {
            const mapped = (response.data || []).map((item: any) => ({
              label: item.label,
              value: String(item.value),
            }));
            setOptions(mapped);
          }
        } catch (err: any) {
          // Игнорируем ошибку отмены
          if (err.name !== 'AbortError') {
            console.error('Ошибка поиска:', err);
          }
        } finally {
          if (!abortController?.signal.aborted) {
            setIsLoading(false);
          }
        }
      }, 500); // 500мс задержка
    };
  })();

  return (
    <ControlledMultiselect
      control={control}
      name={name}
      options={options}
      isLoading={isLoading}
      onInputChange={handleChange}
      {...rest}
    />
  );
};