export const useTableState = <TableRow>(
  initialFilters: Record<string, string> = {},
  defaults?: UseTableDefaults<TableRow>,
  startKey?: string
) => {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Добавить префикс startKey к ключу параметра
  const addKeyPrefix = (key: string): string => {
    return startKey ? `${startKey}_${key}` : key;
  };

  // Удалить префикс startKey из ключа параметра
  const removeKeyPrefix = (key: string): string => {
    if (!startKey || !key.startsWith(`${startKey}_`)) return key;
    return key.substring(startKey.length + 1);
  };

  // Сохранение с учетом startKey
  const setStorage = (sp: URLSearchParams) => {
    const paramsObj = Object.fromEntries(sp);
    const { page_size, ...rest } = paramsObj;
    const storageKey = pathname;
    
    // Для sessionStorage сохраняем все параметры кроме page_size с префиксом
    const sessionParams = new URLSearchParams();
    Object.entries(rest).forEach(([key, value]) => {
      sessionParams.set(addKeyPrefix(key), value);
    });
    sessionStorage.setItem(storageKey, sessionParams.toString());
    
    // Для localStorage сохраняем только page_size с префиксом
    if (page_size) {
      const localParams = new URLSearchParams();
      localParams.set(addKeyPrefix('page_size'), page_size);
      localStorage.setItem(storageKey, localParams.toString());
    }
  };

  // Получение параметров из storage с учетом startKey
  const getDefaultParams = <TableRow>(props: {
    defaultParams?: UseTableDefaults<TableRow>;
    pathname: string;
  }): URLSearchParams => {
    const { defaultParams, pathname } = props;
    const initial: Record<string, string> = {};
    
    const storageKey = pathname;
    const sessionStorageParams = sessionStorage.getItem(storageKey) || "";
    const localStorageParams = localStorage.getItem(storageKey) || "";
    const parts = [sessionStorageParams, localStorageParams].filter(Boolean);

    // Собираем параметры из storage, удаляя префикс startKey
    if (parts.length > 0) {
      const allParams = new URLSearchParams(parts.join("&"));
      allParams.forEach((value, key) => {
        const cleanKey = removeKeyPrefix(key);
        if (cleanKey !== key) {
          initial[cleanKey] = value;
        }
      });
    }

    // Добавляем параметры по умолчанию
    if (defaultParams?.defaultPagination) {
      Object.assign(initial, {
        page: String(defaultParams.defaultPagination.page),
        page_size: String(defaultParams.defaultPagination.page_size),
      });
    }

    if (defaultParams?.defaultSort) {
      Object.assign(initial, {
        column: String(defaultParams.defaultSort.column),
        order: String(defaultParams.defaultSort.order),
      });
    }

    return new URLSearchParams(initial);
  };

  // Получение параметров из URL с учетом startKey
  const getParamsByURL = <TableRow>(
    initialFilters: Record<string, string>,
    searchParams: URLSearchParams,
    defaults?: UseTableDefaults<TableRow>
  ) => {
    const filters = new Map<string, string>(Object.entries(initialFilters));
    
    // Считываем параметры из URL, удаляя префикс startKey
    searchParams.forEach((value, key) => {
      const cleanKey = removeKeyPrefix(key);
      
      if (cleanKey !== "column" && cleanKey !== "order" && cleanKey !== "page" && cleanKey !== "page_size") {
        filters.set(cleanKey, value);
      }
    });

    const getOrder = (urlOrder: string | null): SortOrder => {
      if (urlOrder === "ascend") return "ascend";
      if (urlOrder === "descend") return "descend";
      return null;
    };

    const sorter: Sorter<TableRow> = {
      column: removeKeyPrefix(searchParams.get("column") || "") as keyof TableRow ??
              defaults?.defaultSort?.column as keyof TableRow,
      order: getOrder(searchParams.get("order")) ?? defaults?.defaultSort?.order ?? null,
    };

    const pagination: Pagination = {
      page: Number(searchParams.get("page")) || defaults?.defaultPagination?.page || 1,
      page_size: Number(searchParams.get("page_size")) || defaults?.defaultPagination?.page_size || 20,
    };

    return { filters: Object.fromEntries(filters.entries()), sorter, pagination };
  };

  // Обработчик изменений таблицы с добавлением префикса startKey
  const handleTableStateChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null | string | string[] | undefined>,
    sorter: SorterResult<TableRow> | SorterResult<TableRow>[],
    extra: TableCurrentDataSource<TableRow>
  ): ReturnType<typeof getParamsByURL<TableRow>> => {
    if (extra.action === "sort" && !Array.isArray(sorter)) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        
        if (sorter.field && sorter.order) {
          newParams.set(addKeyPrefix("column"), String(sorter.field));
          newParams.set(addKeyPrefix("order"), String(sorter.order));
        } else {
          newParams.delete(addKeyPrefix("column"));
          newParams.delete(addKeyPrefix("order"));
        }
        newParams.set(addKeyPrefix("page"), "1");
        setStorage(newParams);
        return newParams;
      });
    }

    if (extra.action === "paginate") {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        
        if (pagination.current && pagination.pageSize) {
          newParams.set(addKeyPrefix("page"), String(pagination.current));
          newParams.set(addKeyPrefix("page_size"), String(pagination.pageSize));
        }
        setStorage(newParams);
        return newParams;
      });
    }

    if (extra.action === "filter") {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        const filterEntries = Object.entries(filters);

        filterEntries.forEach(([key, values]) => {
          const prefixedKey = addKeyPrefix(key);
          
          if (!values) {
            newParams.delete(prefixedKey);
            return;
          }

          if (Array.isArray(values) && values.length > 0) {
            newParams.set(prefixedKey, values.join(","));
            return;
          }

          if (typeof values === "string") {
            newParams.set(prefixedKey, values);
          }
        });

        newParams.set(addKeyPrefix("page"), "1");
        setStorage(newParams);
        return newParams;
      });
    }

    return getParamsByURL<TableRow>(initialFilters, searchParams, defaults);
  };

  // Обработчики других функций также должны использовать addKeyPrefix/removeKeyPrefix
  const handleResetFilters = () => {
    setSearchParams((prev) => {
      const pageSize = prev.get(addKeyPrefix("page_size"));
      const column = prev.get(addKeyPrefix("column"));
      const order = prev.get(addKeyPrefix("order"));

      const params = new URLSearchParams();
      params.set(addKeyPrefix("page"), "1");
      
      if (pageSize) params.set(addKeyPrefix("page_size"), pageSize);
      if (column) params.set(addKeyPrefix("column"), column);
      if (order) params.set(addKeyPrefix("order"), order);
      
      sessionStorage.setItem(pathname, params.toString());
      return params;
    });
  };

  // Инициализация параметров из URL
  const { filters, sorter, pagination } = getParamsByURL<TableRow>(
    initialFilters,
    searchParams,
    defaults
  );

  return {
    handleTableStateChange,
    handleResetFilters,
    filters,
    sorter,
    pagination,
    // другие обработчики...
  };
};