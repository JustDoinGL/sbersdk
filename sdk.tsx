import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Control, FieldValues, Path } from 'react-hook-form';

// ==========================================
// 1. ЗАГЛУШКИ (Ты заменишь их на свои реальные)
// ==========================================

// Представим, что это твой ControlledMultiselect из UI-кита
// У него есть пропс onSearch, который вызывается при вводе текста
interface ControlledMultiselectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  options: any[]; // Тут будут наши данные
  isLoading?: boolean;
  onSearch?: (query: string) => void; // Колбэк для поиска
  placeholder?: string;
}

const ControlledMultiselect = <T extends FieldValues>(props: ControlledMultiselectProps<T>) => {
  // Это заглушка, просто чтобы код скомпилировался
  return (
    <div>
      <input 
        placeholder={props.placeholder} 
        onChange={(e) => props.onSearch?.(e.target.value)} 
      />
      <div>Опции: {props.options.map(o => o.label).join(', ')}</div>
    </div>
  );
};

// ==========================================
// 2. ТВОИ ТИПЫ (dictionaries.types.ts)
// ==========================================

export type Dictionary = {
  label: string;
  value: string | number;
};

export type AccidentShortDictionary = {
  paymentOptions: Dictionary[];
  actions: Dictionary[];
  // ... остальные поля
};

export type AutoShortDictionary = {
  brands: Dictionary[];
  models: Dictionary[];
};

export type ProductResponseMap = {
  accidents: AccidentShortDictionary;
  auto: AutoShortDictionary;
};

export type PRODUCT = keyof ProductResponseMap;

export type ProductCodeMap = {
  accidents: 'professions' | 'sports';
  auto: 'brands' | 'models';
};

export type SearchDictionariesParams<T extends PRODUCT> = {
  code: ProductCodeMap[T];
  query?: string;
  page?: number;
  page_size?: number;
};

// ==========================================
// 3. ХУК DEBOUNCE (useDebounce.ts)
// ==========================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ==========================================
// 4. ЗАГЛУШКА API (dictionariesApi.ts)
// ==========================================

const dictionariesApi = {
  searchDictionary: async <T extends PRODUCT>(
    product: T,
    params: SearchDictionariesParams<T>
  ): Promise<Dictionary[]> => {
    console.log(`[API] Запрос: product=${product}, code=${params.code}, query=${params.query}`);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Имитация сети
    
    if (params.code === 'professions') {
      return [{ label: 'Инженер', value: '1' }, { label: 'Врач', value: '2' }];
    }
    return [{ label: 'Тест 1', value: '1' }];
  },
};

// ==========================================
// 5. ХУК REACT QUERY (useDictionarySearch.ts)
// ==========================================

export function useDictionarySearch<T extends PRODUCT>(
  product: T,
  params: Omit<SearchDictionariesParams<T>, 'query'>,
  searchQuery: string,
  delay = 500
) {
  const debouncedQuery = useDebounce(searchQuery, delay);

  return useQuery({
    queryKey: ['dictionaries', product, params.code, debouncedQuery],
    queryFn: () =>
      dictionariesApi.searchDictionary(product, {
        ...params,
        query: debouncedQuery,
      }),
    // Включаем запрос только если есть поисковый запрос (или можно убрать это условие)
    enabled: debouncedQuery.length > 0, 
    staleTime: 5 * 60 * 1000,
  });
}

// ==========================================
// 6. САМ КОМПОНЕНТ (dictionary_multi_select.tsx)
// ==========================================

// Наследуем пропсы от ControlledMultiselect, но переопределяем options и onSearch
type Props<
  FormData extends FieldValues,
  T extends PRODUCT,
  K extends ProductCodeMap[T]
> = {
  control: Control<FormData>;
  name: Path<FormData>;
  product: T;
  code: K;
  placeholder?: string;
} & Omit<React.ComponentProps<typeof ControlledMultiselect<FormData>>, 'options' | 'onSearch' | 'control' | 'name'>;

export const DictionaryMultiSelect = <
  FormData extends FieldValues,
  T extends PRODUCT,
  K extends ProductCodeMap[T]
>({
  control,
  name,
  product,
  code,
  ...rest // Тут останутся placeholder и другие пропсы UI-кита
}: Props<FormData, T, K>) => {
  // 1. Стейт для поиска
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Запрос через React Query
  const { data, isLoading } = useDictionarySearch(
    product,
    { code }, 
    searchQuery
  );

  // 3. Мапим данные в Option[] для твоего UI-кита
  // Если у тебя другой формат, поменяй здесь
  const options = (data || []).map((item) => ({
    label: item.label,
    value: String(item.value),
  }));

  // 4. Отдаем всё в твой существующий ControlledMultiselect
  return (
    <ControlledMultiselect
      control={control}
      name={name}
      options={options}
      isLoading={isLoading}
      onSearch={setSearchQuery} // Передаем ввод пользователя в наш стейт
      {...rest}
    />
  );
};

// ==========================================
// 7. ПРИМЕР ИСПОЛЬЗОВАНИЯ
// ==========================================
const Example = () => {
  const control = {} as Control<any>; // Заглушка для useForm()

  return (
    <div>
      <DictionaryMultiSelect
        control={control}
        name="professions"
        product="accidents"
        code="professions"
        placeholder="Ищите профессию..."
      />
    </div>
  );
};

export default Example;