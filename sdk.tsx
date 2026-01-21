```typescript
// InfiniteScrollVirtual.tsx
import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { 
  useVirtualizer,
  useInfiniteQuery,
  QueryKey,
  UseInfiniteQueryOptions,
  InfiniteData,
  useQueryClient
} from '@tanstack/react-query';
import { Spinner } from '@sg/uikit';

// ==================== ТИПЫ ====================
export interface PageResponse<T> {
  data: T[];
  nextPage?: number;
  hasMore?: boolean;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export interface InfiniteScrollProps<T, P extends QueryParams> {
  /** Базовый ключ для кэширования (например: ['activities', 'list']) */
  queryKey: QueryKey;
  /** Функция для загрузки данных */
  queryFn: (params: P) => Promise<PageResponse<T>>;
  /** Начальные параметры запроса */
  initialParams?: Partial<P>;
  /** Размер страницы */
  pageSize?: number;
  /** Дополнительные опции для useInfiniteQuery */
  queryOptions?: Partial<Omit<
    UseInfiniteQueryOptions<
      PageResponse<T>,
      Error,
      InfiniteData<PageResponse<T>>,
      PageResponse<T>,
      QueryKey,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >>;
  /** Рендер функция для элемента списка */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Высота элемента (пиксели) */
  estimateSize?: number;
  /** Количество предзагружаемых элементов */
  overscan?: number;
  /** CSS класс для контейнера скролла */
  scrollContainerClassName?: string;
  /** CSS класс для элемента списка */
  itemClassName?: string;
  /** Компонент загрузки */
  loadingComponent?: React.ReactNode;
  /** Компонент для пустого списка */
  emptyComponent?: React.ReactNode;
  /** Компонент для ошибки */
  errorComponent?: (error: Error) => React.ReactNode;
  /** Порог срабатывания загрузки следующей страницы (в элементах) */
  endReachedThreshold?: number;
  /** Включен ли запрос */
  enabled?: boolean;
  /** Автоматически сбрасывать скролл при изменении параметров */
  autoResetOnParamsChange?: boolean;
}

// ==================== ХУК ДЛЯ ДАННЫХ ====================
const useInfiniteScrollData = <T, P extends QueryParams>({
  queryKey,
  queryFn,
  initialParams = {},
  pageSize = 20,
  queryOptions = {},
  enabled = true,
  autoResetOnParamsChange = true
}: Pick<InfiniteScrollProps<T, P>, 
  'queryKey' | 'queryFn' | 'initialParams' | 'pageSize' | 'queryOptions' | 'enabled' | 'autoResetOnParamsChange'
>) => {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<Partial<P>>(initialParams);
  const scrollResetKey = useRef(0);

  // Формируем полный ключ запроса
  const fullQueryKey = useMemo((): QueryKey => {
    return [...queryKey, params];
  }, [queryKey, params]);

  // Функция для загрузки страницы
  const fetchPage = useCallback(async ({ pageParam = 1 }: { pageParam?: number }): Promise<PageResponse<T>> => {
    const queryParams: P = {
      ...params,
      page: pageParam,
      pageSize,
    } as P;

    return queryFn(queryParams);
  }, [queryFn, pageSize, params]);

  // Конфигурация запроса
  const queryConfig = useMemo((): UseInfiniteQueryOptions<
    PageResponse<T>,
    Error,
    InfiniteData<PageResponse<T>>,
    PageResponse<T>,
    QueryKey,
    number
  > => ({
    queryKey: fullQueryKey,
    queryFn: fetchPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled,
    ...queryOptions,
  }), [fullQueryKey, fetchPage, enabled, queryOptions]);

  // Запрос данных
  const query = useInfiniteQuery(queryConfig);

  // Плоские данные из всех страниц
  const flatData = useMemo(() => {
    return query.data?.pages.flatMap(page => page.data) || [];
  }, [query.data]);

  // Обновление параметров
  const updateParams = useCallback((newParams: Partial<P>) => {
    setParams(prev => {
      const merged = { ...prev, ...newParams };
      
      // Проверяем, изменились ли параметры (кроме пагинации)
      const hasChanged = Object.keys(newParams).some(key => {
        if (key === 'page' || key === 'pageSize') return false;
        return JSON.stringify(prev[key as keyof P]) !== JSON.stringify(newParams[key as keyof P]);
      });
      
      if (hasChanged && autoResetOnParamsChange) {
        queryClient.cancelQueries({ queryKey: fullQueryKey });
        scrollResetKey.current += 1;
      }
      
      return merged;
    });
  }, [queryClient, fullQueryKey, autoResetOnParamsChange]);

  // Сброс параметров
  const resetParams = useCallback(() => {
    setParams(initialParams);
    queryClient.cancelQueries({ queryKey: fullQueryKey });
    scrollResetKey.current += 1;
  }, [initialParams, queryClient, fullQueryKey]);

  return {
    // Данные
    data: flatData,
    pages: query.data?.pages,
    
    // Состояния
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefetching: query.isRefetching,
    isError: query.isError,
    error: query.error,
    
    // Пагинация
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    
    // Параметры и действия
    params,
    updateParams,
    resetParams,
    refetch: query.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: fullQueryKey }),
    
    // Мета
    totalItems: flatData.length,
    currentPage: query.data?.pageParams?.length || 0,
    scrollResetKey: scrollResetKey.current,
  };
};

// ==================== КОМПОНЕНТ ====================
export const InfiniteScrollVirtual = <T, P extends QueryParams = QueryParams>({
  queryKey,
  queryFn,
  initialParams = {},
  pageSize = 20,
  queryOptions = {},
  renderItem,
  estimateSize = 150,
  overscan = 5,
  scrollContainerClassName = '',
  itemClassName = '',
  loadingComponent = <Spinner size={48} />,
  emptyComponent = <div className="text-center py-12 text-gray-500">Нет данных для отображения</div>,
  errorComponent = (error) => <div className="text-center py-12 text-red-500">Ошибка загрузки: {error.message}</div>,
  endReachedThreshold = 3,
  enabled = true,
  autoResetOnParamsChange = true,
}: InfiniteScrollProps<T, P>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerTargetRef = useRef<HTMLDivElement>(null);
  const previousDataLengthRef = useRef(0);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    scrollResetKey,
  } = useInfiniteScrollData<T, P>({
    queryKey,
    queryFn,
    initialParams,
    pageSize,
    queryOptions,
    enabled,
    autoResetOnParamsChange,
  });

  // Виртуализатор
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimateSize,
    overscan,
    key: scrollResetKey, // Сбрасываем виртуализатор при изменении параметров
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Intersection Observer для бесконечного скролла
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || data.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: `${estimateSize * endReachedThreshold}px`,
        threshold: 0.1,
      }
    );

    const currentTarget = observerTargetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, data.length, estimateSize, endReachedThreshold]);

  // Отслеживаем изменение количества данных для прокрутки в начало при фильтрации
  useEffect(() => {
    if (previousDataLengthRef.current > 0 && data.length > 0 && 
        data.length < previousDataLengthRef.current && 
        scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    previousDataLengthRef.current = data.length;
  }, [data.length]);

  // Состояние начальной загрузки
  if (isLoading && data.length === 0) {
    return <>{loadingComponent}</>;
  }

  // Состояние ошибки
  if (isError && data.length === 0) {
    return <>{errorComponent(error)}</>;
  }

  // Пустой список
  if (!isLoading && data.length === 0) {
    return <>{emptyComponent}</>;
  }

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-auto ${scrollContainerClassName}`}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            position: 'relative',
            width: '100%',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const item = data[virtualItem.index];
            
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                className={`absolute top-0 left-0 w-full ${itemClassName}`}
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {renderItem(item, virtualItem.index)}
              </div>
            );
          })}
        </div>

        {/* Элемент-триггер для загрузки следующей страницы */}
        {hasNextPage && (
          <div
            ref={observerTargetRef}
            style={{
              height: `${estimateSize * endReachedThreshold}px`,
              position: 'relative',
            }}
            className="flex items-center justify-center"
          >
            {isFetchingNextPage && loadingComponent}
          </div>
        )}

        {/* Сообщение о конце списка */}
        {!hasNextPage && data.length > 0 && (
          <div className="text-center py-6 text-sm text-gray-400">
            Все данные загружены
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

/**
 * Создает конфигурацию для InfiniteScrollVirtual в стиле queryOptions
 */
export const createInfiniteScrollConfig = <T, P extends QueryParams = QueryParams>(
  baseKey: QueryKey,
  queryFn: (params: P) => Promise<PageResponse<T>>,
  defaultParams: Partial<P> = {}
) => {
  const getQueryKey = (params?: Partial<P>): QueryKey => {
    const fullParams = { ...defaultParams, ...params };
    return [...baseKey, 'list', fullParams];
  };

  const getQueryOptions = (
    params?: Partial<P>,
    options?: Partial<UseInfiniteQueryOptions<
      PageResponse<T>,
      Error,
      InfiniteData<PageResponse<T>>,
      PageResponse<T>,
      QueryKey,
      number
    >>
  ) => {
    const queryKey = getQueryKey(params);
    
    return {
      queryKey,
      queryFn: ({ pageParam = 1 }: { pageParam?: number }) => {
        const queryParams: P = {
          ...defaultParams,
          ...params,
          page: pageParam,
          pageSize: 20,
        } as P;
        
        return queryFn(queryParams);
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage: PageResponse<T>) => lastPage.nextPage,
      ...options,
    };
  };

  return {
    baseKey,
    getQueryKey,
    getQueryOptions,
  };
};

/**
 * Хук для управления состоянием InfiniteScrollVirtual
 */
export const useInfiniteScrollState = <P extends QueryParams>(
  initialParams: Partial<P> = {}
) => {
  const [params, setParams] = useState<Partial<P>>(initialParams);

  const updateParams = useCallback((newParams: Partial<P>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const resetParams = useCallback(() => {
    setParams(initialParams);
  }, [initialParams]);

  return {
    params,
    updateParams,
    resetParams,
  };
};

// ==================== ПРИМЕР ИСПОЛЬЗОВАНИЯ ====================

// 1. Определяем типы
/*
interface Activity {
  id: string;
  title: string;
  createdAt: string;
}

interface ActivityParams extends QueryParams {
  status?: string;
  type?: string;
  userId?: string;
}

// 2. Создаем конфигурацию
const activityConfig = createInfiniteScrollConfig<Activity, ActivityParams>(
  ['activities'],
  async (params) => {
    const response = await api.getActivities(params);
    return {
      data: response.results,
      nextPage: response.next ? (params.page || 1) + 1 : undefined,
    };
  },
  { status: 'active', pageSize: 20 }
);

// 3. Используем в компоненте
const ActivityList = () => {
  const { params, updateParams } = useInfiniteScrollState<ActivityParams>({
    status: 'active'
  });

  return (
    <InfiniteScrollVirtual
      {...activityConfig.getQueryOptions(params)}
      renderItem={(activity) => <ActivityCard activity={activity} />}
      estimateSize={120}
    />
  );
};
*/
```